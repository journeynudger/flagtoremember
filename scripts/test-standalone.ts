// Offline checks: never call Airtable, Stripe, Gmail, or Mailchimp for real.
import assert from "node:assert/strict";
import test from "node:test";
import type Stripe from "stripe";
import { formBatches, submission, donationBatch, SUBMISSION_FIELD, TABLES } from "../lib/submissions/mapping";
import { saveBatch } from "../lib/submissions/airtable";
import { verifyCaptcha } from "../lib/submissions/captcha";
import { emailHtml, subscribe } from "../lib/submissions/notifications";
import { donationAmount, paidDonation, STRIPE_PURPOSE } from "../lib/submissions/stripe";

const id = "67e55044-10b1-426f-9247-bb680e5fe0c8";
const donor = {
  "input_6.3": "Test", "input_6.6": "Donor", input_7: "9105550123", input_8: "setup-test@example.com", input_11: "1",
  input_70: "SGT TEST", input_18: "Army", input_15: "Army OCP", input_16: "Natural Causes",
  "input_87.3": "Fayetteville", "input_87.4": "North Carolina", "input_88.3": "Savannah", "input_88.4": "Georgia",
  input_90: "No", input_76: "No", input_91: "No", input_94: "No",
};

test("retries have stable keys; edits and separate submissions have distinct keys", () => {
  const original = submission(5, id, donor);
  assert.equal(original.id, submission(5, id, { ...donor }).id);
  assert.notEqual(original.id, submission(5, id, { ...donor, input_70: "SGT EDITED" }).id);
  assert.notEqual(original.id, submission(5, "another-id", donor).id);
});

test("hidden name and organization values are excluded before saving", () => {
  const s = submission(5, id, { ...donor, input_71: "LEFTOVER", input_100: "Hidden organization" });
  const batches = formBatches(s);
  assert.equal(batches[1].records.length, 1);
  assert.equal(batches[0].records[0].fields.fld1hPYcXlVIRADmQ, "SGT TEST");
  assert.equal(batches[0].records[0].fields.fldL08gAvP2kpcyHe, "");
  assert.equal(batches[1].records[0].fields.fldFqwxTbRQJcvCKN, "");
});

test("five names produce one summary and five separate registry rows", () => {
  const v = { ...donor, input_11: "5", input_90: "Yes", input_100: "VFW Test", "input_101.3": "Pat", "input_101.6": "Host", input_102: "host@example.com", input_103: "9105550199" };
  const groups = [[70,18,15,16,17],[71,24,21,22,23],[72,31,28,29,30],[73,37,34,35,36],[74,43,40,41,42]];
  for (const [i, [n,b,m,c,o]] of groups.entries()) Object.assign(v, { [`input_${n}`]: `NAME ${i+1}`, [`input_${b}`]: "Army", [`input_${m}`]: "Army OCP", [`input_${c}`]: "Other", [`input_${o}`]: "Test cause" });
  const batches = formBatches(submission(5, id, v));
  assert.deepEqual(batches.map((b) => [b.table, b.records.length]), [[TABLES.donations, 1], [TABLES.registry, 5]]);
  assert.equal(batches[0].records[0].fields.fldiDeBxioLEJGr4W, "5");
  assert.equal(batches[0].records[0].fields.fldeTD0iGayQpfNKy, 0);
  assert.equal(new Set(batches[1].records.map((r) => r.fields[SUBMISSION_FIELD])).size, 5);
  assert.equal(batches[1].records[4].fields.fldtvDlwrhqs0drdf, "NAME 5");
  assert.equal(batches[1].records[4].fields.flds0LQZx8kLb4zl8, "Test cause");
  assert.equal(batches[1].records[0].fields.fld71Hk8sFsMS0qmb, "Pat Host");
  assert.equal(batches[0].records[0].fields.fldfQ0tXVu3du4YuV, "host@example.com");
});

test("contact and newsletter retain the existing Airtable field mappings", () => {
  const contact = formBatches(submission(8, id, { input_1: "Test org", input_3: "test@example.com", input_7: "Other", input_4: "Question", input_8: "Comments" }))[0];
  assert.equal(contact.table, TABLES.contact);
  assert.equal(contact.records[0].fields.fld5QhQjWBNaMqpwW, "Question");
  assert.equal(contact.records[0].fields.fldmIk42a21oSnJkG, "Comments");
  const newsletter = formBatches(submission(6, id, { input_1: "test@example.com" }))[0];
  assert.equal(newsletter.records[0].fields.fld2k2AINWX08ePdm, "Email List");
});

test("donation amounts reject invalid precision, nonpositive and oversized amounts", () => {
  for (const bad of [undefined, 30, "0", "-1", "0.99", "1.001", "NaN", "Infinity", "1e3", "1000000"]) assert.equal(donationAmount(bad), null);
  assert.equal(donationAmount("15"), 1500);
  assert.equal(donationAmount("30.50"), 3050);
});

test("only a paid USD donation from this checkout can produce a donation record", () => {
  const session = { id: "cs_test_fixture", metadata: { purpose: STRIPE_PURPOSE }, mode: "payment", payment_status: "paid", currency: "usd", amount_total: 3050, customer_details: { name: "Test Donor", email: "test@example.com" } } as unknown as Stripe.Checkout.Session;
  for (const changes of [{ payment_status: "unpaid" }, { currency: "eur" }, { metadata: {} }, { mode: "subscription" }]) assert.equal(paidDonation({ ...session, ...changes } as Stripe.Checkout.Session), null);
  const d = paidDonation(session)!;
  const row = donationBatch(d).records[0].fields;
  assert.equal(row[SUBMISSION_FIELD], "stripe:cs_test_fixture");
  assert.equal(row.fldeTD0iGayQpfNKy, 30.5);
  assert.equal(row.fldiDeBxioLEJGr4W, "0");
});

test("confirmation templates escape names and use locally hosted image assets", () => {
  for (const kind of ["registration", "contact", "share", "donation"] as const) {
    const html = emailHtml(kind, '<script>"A&B"</script>');
    assert.ok(!html.includes("<script>"));
    assert.ok(html.includes("&lt;script&gt;"));
    assert.ok(!html.includes("/wp-content/"));
  }
  assert.ok(emailHtml("share", "Test").includes("cognitoforms.com/FlagToRememberFoundation/"));
});

test("external integrations fail closed and use retry-safe payloads", async (t) => {
  const requests: { url: string; init?: RequestInit }[] = [];
  let responseBody: unknown = { records: [{}] };
  let status = 200;
  t.mock.method(globalThis, "fetch", async (url: string | URL | Request, init?: RequestInit) => {
    requests.push({ url: String(url), init });
    return new Response(JSON.stringify(responseBody), { status, headers: { "Content-Type": "application/json" } });
  });
  const keys = ["AIRTABLE_TOKEN", "RECAPTCHA_SECRET_KEY", "FTR_MAILCHIMP_API_KEY"];
  const old = keys.map((k) => process.env[k]);
  process.env.AIRTABLE_TOKEN = "fake-token";
  process.env.RECAPTCHA_SECRET_KEY = "fake-secret";
  process.env.FTR_MAILCHIMP_API_KEY = "fake-key-us1";
  try {
    const batch = formBatches(submission(6, id, { input_1: "test@example.com" }))[0];
    await saveBatch(batch);
    await saveBatch(batch);
    assert.equal(requests[0].init?.body, requests[1].init?.body);
    assert.deepEqual(JSON.parse(String(requests[0].init?.body)).performUpsert, { fieldsToMergeOn: [SUBMISSION_FIELD] });
    status = 503;
    await assert.rejects(saveBatch(batch), /HTTP 503/);
    status = 200;
    responseBody = { records: [] };
    await assert.rejects(saveBatch(batch), /incomplete save/);
    assert.equal(await verifyCaptcha(undefined), false);
    responseBody = { success: true, hostname: "attacker.example" };
    assert.equal(await verifyCaptcha("token"), false);
    responseBody = { success: true, hostname: "flagtoremember.com" };
    assert.equal(await verifyCaptcha("token"), true);
    responseBody = { success: false, hostname: "flagtoremember.com" };
    assert.equal(await verifyCaptcha("token"), false);
    responseBody = {};
    await subscribe("TEST@example.com");
    const mailchimpBody = JSON.parse(String(requests.at(-1)?.init?.body));
    assert.equal(mailchimpBody.email_address, "test@example.com");
    assert.equal(mailchimpBody.status_if_new, "subscribed");
    assert.ok(!("status" in mailchimpBody), "An existing unsubscribe preference must survive");
  } finally {
    keys.forEach((k, i) => { if (old[i] === undefined) delete process.env[k]; else process.env[k] = old[i]; });
  }
});
