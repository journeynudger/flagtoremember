import { createHook } from "workflow";
import type { Submission, Donation } from "@/lib/submissions/mapping";
import { sendEmail, sendAdmin, subscribe, type EmailKind } from "@/lib/submissions/notifications";
import { getForm, isVisible, inputNames } from "@/lib/forms/schema";

async function emailStep(kind: EmailKind, email: string, name: string, id: string) {
  "use step";
  await sendEmail(kind, email, name, id);
}
emailStep.maxRetries = 5;

async function subscribeStep(email: string, first: string, last: string) {
  "use step";
  await subscribe(email, first, last);
}
subscribeStep.maxRetries = 5;

async function adminFormStep(s: Submission) {
  "use step";
  const form = getForm(s.formId)!;
  const details: Record<string, string> = {};
  for (const field of form.fields) {
    if (!isVisible(field, s.values)) continue;
    details[field.label] = inputNames(field).map((key) => s.values[key]).filter(Boolean).join(" ");
  }
  await sendAdmin(`New submission from ${form.title}`, details, s.id, s.formId === 5 ? s.values.input_8 : s.values.input_3);
}
adminFormStep.maxRetries = 5;

async function adminDonationStep(d: Donation) {
  "use step";
  await sendAdmin("New donation to Flag to Remember", { Name: d.name, Email: d.email, Phone: d.phone, "Amount (USD)": (d.amountCents / 100).toFixed(2), "Stripe checkout": d.id }, d.id, d.email);
}
adminDonationStep.maxRetries = 5;

/** Airtable is saved before this workflow starts; retries here cannot duplicate it. */
export async function formNotifications(s: Submission) {
  "use workflow";
  const guard = createHook({ token: `form-notifications:${s.id}`, experimental_minRetention: "30d" });
  const conflict = await guard.getConflict();
  if (conflict) return { duplicate: true, runId: conflict.runId };
  const v = s.values;
  if (s.formId === 6) {
    await subscribeStep(v.input_1, "", "");
  } else if (s.formId === 8) {
    await Promise.all([emailStep("contact", v.input_3, v.input_1, s.id), adminFormStep(s)]);
  } else if (s.formId === 5) {
    const email = v.input_8;
    const first = v["input_6.3"];
    await Promise.all([
      emailStep("registration", email, first, s.id),
      subscribeStep(email, first, v["input_6.6"]),
      adminFormStep(s),
      ...(v.input_76?.toLowerCase() === "yes, i'd like to share" ? [emailStep("share", email, first, s.id)] : []),
    ]);
  }
  return { duplicate: false };
}

export async function donationNotifications(d: Donation) {
  "use workflow";
  const guard = createHook({ token: `donation-notifications:${d.id}`, experimental_minRetention: "30d" });
  const conflict = await guard.getConflict();
  if (conflict) return { duplicate: true, runId: conflict.runId };
  if (d.email) await Promise.all([
    emailStep("donation", d.email, d.name.split(" ")[0] || "friend", d.id),
    subscribeStep(d.email, d.name.split(" ")[0] || "", d.name.split(" ").slice(1).join(" ")),
    adminDonationStep(d),
  ]);
  return { duplicate: false };
}
