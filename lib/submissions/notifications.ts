import { createHash } from "node:crypto";
import nodemailer from "nodemailer";
import templates from "@/content/emails/templates.json";
import { required, saveBatch } from "./airtable";
import { SUBMISSION_FIELD } from "./mapping";
import { previewTesting } from "./environment";

async function capturePreview(kind: string, recipient: string, subject: string, body: string, id: string) {
  if (!previewTesting()) return false;
  await saveBatch({ table: required("FTR_TEST_OUTBOX_TABLE"), records: [{ fields: {
    [SUBMISSION_FIELD]: `${id}:${kind}`, Kind: kind, Recipient: recipient, Subject: subject, Body: body,
  } }] });
  return true;
}

export type EmailKind = keyof typeof templates;
const subjects: Record<EmailKind, string> = {
  registration: "Welcome to the Flag to Remember Family – You’re Now in the Hall of Honor",
  contact: "Thank You For Contacting Us",
  share: "Share Your Memories with Flag to Remember",
  donation: "You’re Officially Part of the Flag to Remember Family",
};
export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
export function emailHtml(kind: EmailKind, name: string) {
  return templates[kind].replaceAll("{{FIRST_NAME}}", escapeHtml(name)).replaceAll("{{NAME}}", escapeHtml(name));
}

export async function sendEmail(kind: EmailKind, email: string, name: string, submissionId: string) {
  if (await capturePreview(kind, email, subjects[kind], emailHtml(kind, name), submissionId)) return;
  const from = required("FTR_GMAIL_ADDRESS");
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com", port: 587, secure: false, requireTLS: true,
    auth: { user: from, pass: required("FTR_GMAIL_APP_PASSWORD") },
    connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 20_000,
  });
  // A stable Message-ID also helps mail servers identify repeated SMTP deliveries.
  const key = createHash("sha256").update(`${submissionId}:${kind}`).digest("hex");
  await transport.sendMail({
    from: { name: "Flag to Remember", address: from }, to: { address: email, name: "" }, replyTo: from,
    subject: subjects[kind], html: emailHtml(kind, name), messageId: `<${key}@flagtoremember.com>`,
  });
}

export async function sendAdmin(subject: string, details: Record<string, string | number>, id: string, replyTo?: string) {
  const text = Object.entries(details).map(([label, answer]) => `${label}: ${answer}`).join("\n\n");
  if (await capturePreview("admin", "migration-admin@example.com", subject, text, id)) return;
  const from = required("FTR_GMAIL_ADDRESS");
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com", port: 587, secure: false, requireTLS: true,
    auth: { user: from, pass: required("FTR_GMAIL_APP_PASSWORD") },
    connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 20_000,
  });
  const key = createHash("sha256").update(`${id}:admin`).digest("hex");
  await transport.sendMail({
    from: { name: "Flag to Remember", address: from }, to: required("FTR_ADMIN_EMAIL"), replyTo: { address: replyTo || from, name: "" },
    subject, text,
    messageId: `<${key}@flagtoremember.com>`,
  });
}

export async function subscribe(email: string, first = "", last = "") {
  const testId = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  if (await capturePreview("mailchimp", email, "Mailchimp subscription", JSON.stringify({ first, last }), testId)) return;
  const key = required("FTR_MAILCHIMP_API_KEY");
  const dc = key.split("-").at(-1);
  if (!dc || !/^us\d+$/.test(dc)) throw new Error("Invalid Mailchimp configuration");
  const normalized = email.trim().toLowerCase();
  const member = createHash("md5").update(normalized).digest("hex");
  const response = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/612c639174/members/${member}`, {
    method: "PUT",
    headers: { Authorization: `Basic ${Buffer.from(`website:${key}`).toString("base64")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email_address: normalized, status_if_new: "subscribed", merge_fields: {
      ...(first ? { FNAME: first } : {}), ...(last ? { LNAME: last } : {}),
    } }),
    signal: AbortSignal.timeout(15_000),
  });
  // Omitting `status` preserves an existing member's unsubscribe preference.
  if (!response.ok) throw new Error(`Mailchimp HTTP ${response.status}`);
}
