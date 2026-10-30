import { start } from "workflow/api";
import { formNotifications } from "@/workflows/notifications";
import { required, saveBatch } from "./airtable";
import { formBatches, submission } from "./mapping";
import { verifyCaptcha } from "./captcha";
import type { Values } from "@/lib/forms/schema";
import { assertDataEnvironment, previewTesting } from "./environment";

export function assertReady(formId: number) {
  assertDataEnvironment();
  for (const key of ["AIRTABLE_TOKEN", "RECAPTCHA_SECRET_KEY"]) required(key);
  if (previewTesting()) {
    required("AIRTABLE_TEST_SCHEMA_MAP");
    required("FTR_TEST_OUTBOX_TABLE");
    return;
  }
  for (const key of ["FTR_GMAIL_ADDRESS", "FTR_GMAIL_APP_PASSWORD"]) required(key);
  if (formId !== 6) required("FTR_ADMIN_EMAIL");
  if (formId === 5 || formId === 6) required("FTR_MAILCHIMP_API_KEY");
}

export async function standaloneSubmit(formId: number, values: Values, requestId: unknown, captcha: unknown, validateOnly: boolean) {
  if (typeof requestId !== "string" || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(requestId)) {
    return { ok: false as const, status: 400, message: "Please refresh the page and try again." };
  }
  assertReady(formId);
  if (!await verifyCaptcha(captcha)) return {
    ok: false as const, status: 422,
    message: "We couldn’t confirm you’re not a robot. Please press the button again.",
  };
  if (validateOnly) return { ok: true as const };
  const entry = submission(formId, requestId, values);
  // All records must exist before the browser says the names are registered.
  for (const batch of formBatches(entry)) await saveBatch(batch);
  await start(formNotifications, [entry]);
  return { ok: true as const };
}
