// Battle test for /api/forms/<id>, 26 checks.
//   npm run build && FORMS_MODE=validate npx next start -p 3217
//   npm run test:forms -- http://localhost:3217
// With FORMS_MODE=validate, valid entries go to Gravity Forms' validation endpoint on WordPress:
// nothing is saved and nothing is emailed. Never run it against a server without FORMS_MODE=validate,
// or the valid cases become real entries. Test emails use gmail.com because the live Gravity Forms
// rejects example.com addresses.
const BASE = process.argv[2] ?? "http://localhost:3217";
let n = 0, failed = 0;
const old = Date.now() - 60_000;
async function post(id, body, raw) {
  n++;
  const res = await fetch(`${BASE}/api/forms/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": `10.0.0.${n}` },
    body: raw ?? JSON.stringify(body),
  });
  return { status: res.status, data: await res.json().catch(() => null) };
}
function check(name, cond, got) {
  if (cond) console.log(`  ok   ${name}`);
  else { failed++; console.log(`  FAIL ${name}\n       ${JSON.stringify(got)}`); }
}
const contact = { input_1: "Test Org", input_3: "ftr.sitetest@gmail.com", input_7: "Other", input_4: "Testing the form", input_8: "" };
const nameBlock = (i, name, cause = "Natural Causes") => {
  const ids = [[70, 18, 15, 16, 17], [71, 24, 21, 22, 23], [72, 31, 28, 29, 30], [73, 37, 34, 35, 36], [74, 43, 40, 41, 42]][i];
  return { [`input_${ids[0]}`]: name, [`input_${ids[1]}`]: "Army", [`input_${ids[2]}`]: "Army OCP", [`input_${ids[3]}`]: cause, ...(cause === "Other" ? { [`input_${ids[4]}`]: "Test cause" } : {}) };
};
const addBase = {
  "input_6.3": "Test", "input_6.6": "Donor", input_7: "9105550123", input_8: "ftr.sitetest@gmail.com", input_11: "1",
  ...nameBlock(0, "SGT TEST NAME"),
  "input_87.3": "Fayetteville", "input_87.4": "North Carolina", "input_88.3": "Savannah", "input_88.4": "Georgia",
  input_90: "No", input_76: "No", input_91: "No", input_94: "No",
};

console.log("Contact (form 8)");
let r = await post(8, { values: {}, startedAt: old });
check("empty → 422 with all 4 required fields", r.status === 422 && ["1", "3", "7", "4"].every((k) => r.data.errors[k]), r);
r = await post(8, { values: { ...contact, input_3: "not-an-email" }, startedAt: old });
check("bad email → 422 on field 3 only", r.status === 422 && Object.keys(r.data.errors).join() === "3", r);
r = await post(8, { values: { ...contact, input_7: "Made up option" }, startedAt: old });
check("option not on the list → 422", r.status === 422 && r.data.errors["7"], r);
r = await post(8, { values: { ...contact, input_4: "   " }, startedAt: old });
check("whitespace-only answer → required", r.status === 422 && r.data.errors["4"], r);
r = await post(8, { values: contact, startedAt: old });
check("valid → Gravity Forms validation accepts every field", r.status === 200 && r.data.ok && r.data.mode === "validate" && r.data.captchaChecked === false, r);
r = await post(8, { values: contact, captcha: "forged-token", startedAt: old });
check("forged reCAPTCHA token → rejected by Gravity Forms", r.status === 422 && !r.data.ok && /robot/.test(r.data.message), r);
r = await post(8, { values: contact, hp: "spam", startedAt: old });
check("honeypot filled → quiet fake success", r.status === 200 && r.data.ok && !r.data.mode, r);
r = await post(8, { values: contact, startedAt: Date.now() });
check("sent in under 2s → quiet fake success", r.status === 200 && r.data.ok && !r.data.mode, r);
r = await post(8, { values: { ...contact, input_999: "x", "evil": "x", input_1: { $ne: 1 } }, startedAt: old });
check("unknown and non-string inputs dropped → name required", r.status === 422 && r.data.errors["1"], r);

r = await post(8, { values: { ...contact, input_3: "someone@example.com" }, startedAt: old });
check("address Gravity Forms refuses (example.com) → its message on field 3", r.status === 422 && /invalid/.test(r.data.errors["3"] ?? ""), r);
console.log("Add a Name (form 5)");
r = await post(5, { values: {}, startedAt: old });
check("empty → 422, sends you to page 1", r.status === 422 && r.data.page === 1 && r.data.errors["6"] && r.data.errors["70"], r);
r = await post(5, { values: { ...addBase, input_7: "555-12" }, startedAt: old });
check("short phone → 422", r.status === 422 && r.data.errors["7"], r);
r = await post(5, { values: { ...addBase, input_70: "THIS NAME IS FAR TOO LONG" }, startedAt: old });
check("name over 18 characters → 422 on page 2", r.status === 422 && r.data.errors["70"] && r.data.page === 2, r);
r = await post(5, { values: { ...addBase, input_16: "Other" }, startedAt: old });
check("cause Other without detail → 422 on field 17", r.status === 422 && r.data.errors["17"], r);
r = await post(5, { values: { ...addBase, input_11: "3", ...nameBlock(1, "NAME TWO") }, startedAt: old });
check("3 names chosen, only 2 filled → name 3 required", r.status === 422 && r.data.errors["72"] && !r.data.errors["74"], r);
r = await post(5, { values: { ...addBase, input_90: "Yes" }, startedAt: old });
check("flag being advertised = Yes → organization required", r.status === 422 && r.data.errors["100"], r);
r = await post(5, { values: { ...addBase, input_91: "Yes" }, startedAt: old });
check("interested in helping = Yes → where do you live required", r.status === 422 && r.data.errors["93"], r);
r = await post(5, { values: { ...addBase, "input_88.4": "Narnia" }, startedAt: old });
check("state not on the list → 422", r.status === 422 && r.data.errors["88"], r);
r = await post(5, { values: addBase, startedAt: old });
check("1 name, valid → Gravity Forms accepts every field", r.status === 200 && r.data.ok && r.data.mode === "validate", r);
const five = { ...addBase, input_11: "5", ...nameBlock(0, "SGT JOHN \"ACE\" DOE", "Other"), ...nameBlock(1, "DAD 02/11/15"), ...nameBlock(2, "CPL JANE ROE", "Suicide"), ...nameBlock(3, "FF M. SMITH"), ...nameBlock(4, "OFC R. LEE", "Prefer Not to Say"),
  input_90: "Yes", input_100: "VFW Post Test", "input_101.3": "Pat", "input_101.6": "Host", input_102: "ftr.hosttest@gmail.com", input_103: "(910) 555-0199",
  input_76: "Yes, I'd like to share", input_91: "Yes", "input_93.3": "Raleigh", "input_93.4": "North Carolina", input_94: "Yes" };
r = await post(5, { values: five, startedAt: old });
check("5 names + every Yes branch → Gravity Forms accepts every field", r.status === 200 && r.data.ok && r.data.mode === "validate", r);
r = await post(5, { values: { ...addBase, ...nameBlock(1, "LEFTOVER"), input_100: "" }, startedAt: old });
check("values left in hidden fields don't block (1 name chosen)", r.status === 200 && r.data.ok, r);

console.log("Stay Updated (form 6)");
r = await post(6, { values: { input_1: "" }, startedAt: old });
check("empty email → 422", r.status === 422 && r.data.errors["1"], r);
r = await post(6, { values: { input_1: "ftr.newstest@gmail.com" }, startedAt: old });
check("valid → Gravity Forms accepts", r.status === 200 && r.data.ok && r.data.mode === "validate", r);

console.log("Transport");
r = await post(99, { values: {} });
check("unknown form → 404", r.status === 404, r);
r = await post(8, null, "{not json");
check("malformed JSON → 400", r.status === 400, r);
r = await post(8, null, JSON.stringify({ values: { input_4: "x".repeat(60_000) } }));
check("oversized body → 413", r.status === 413, r);
const get = await fetch(`${BASE}/api/forms/8`);
check("GET → 405", get.status === 405, get.status);
const rlip = `10.200.${Math.floor(Math.random()*250)}.${Math.floor(Math.random()*250)}`;
let limited = 0;
for (let i = 0; i < 10; i++) {
  const res = await fetch(`${BASE}/api/forms/6`, { method: "POST", headers: { "Content-Type": "application/json", "X-Forwarded-For": rlip }, body: JSON.stringify({ values: {}, startedAt: old }) });
  if (res.status === 429) limited++;
}
check("10 quick posts from one address → rate limited after 8", limited === 2, limited);

console.log(`\n${n} requests, ${failed} failed`);
process.exit(failed ? 1 : 0);
