import { NextResponse } from "next/server";
import { wordpressOrigin } from "@/lib/content";
import { firstErrorPage, getForm, payload, validate, type Errors, type Values } from "@/lib/forms/schema";

/**
 * POST /api/forms/<id> — every form on the site submits here.
 *
 * It checks the entry with the same rules the browser used, then hands it to the
 * Gravity Forms that still run on WordPress (its REST API), so entries, notification
 * emails and any feeds keep working exactly as before. Gravity Forms checks the
 * reCAPTCHA token itself and has the final word: its "no" is passed back field by field.
 *
 * FORMS_MODE (optional):
 *   validate  ask Gravity Forms' validation endpoint instead; nothing is saved or emailed
 *   dry       check locally only; nothing leaves this server
 */

export interface SubmitBody { values?: Values; captcha?: string; hp?: string; startedAt?: number }
export type SubmitReply =
  | { ok: true; message: string; mode?: "validate" | "dry"; captchaChecked?: boolean }
  | { ok: false; errors?: Errors; page?: number; message?: string };

const MAX_BODY = 50_000;
const FAIL = "Something went wrong sending this. Please try again, or email anthony@flagtoremember.com.";

// Best effort per-instance limit: 8 submissions a minute from one address.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length > 8;
}

const reply = (body: SubmitReply, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request, ctx: RouteContext<"/api/forms/[id]">) {
  const { id } = await ctx.params;
  const form = getForm(Number(id));
  if (!form) return reply({ ok: false, message: "Unknown form." }, 404);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return reply({ ok: false, message: "Too many tries in a minute. Please wait a moment and try again." }, 429);

  const raw = await request.text();
  if (raw.length > MAX_BODY) return reply({ ok: false, message: FAIL }, 413);
  let body: SubmitBody;
  try {
    body = JSON.parse(raw) as SubmitBody;
  } catch {
    return reply({ ok: false, message: FAIL }, 400);
  }

  // Only Gravity Forms input names, as strings.
  const values: Values = {};
  for (const [name, value] of Object.entries(body.values ?? {})) {
    if (/^input_\d+(\.\d+)?$/.test(name) && typeof value === "string") values[name] = value.slice(0, 5_000);
  }

  // Honeypot filled, or sent faster than a person can type: look successful, send nothing.
  if (body.hp || (typeof body.startedAt === "number" && Date.now() - body.startedAt < 2_000)) {
    return reply({ ok: true, message: form.confirmation });
  }

  const errors = validate(form, values);
  if (Object.keys(errors).length) {
    return reply({ ok: false, errors, page: firstErrorPage(form, errors) }, 422);
  }

  const mode = process.env.FORMS_MODE === "validate" || process.env.FORMS_MODE === "dry" ? process.env.FORMS_MODE : undefined;
  if (mode === "dry") return reply({ ok: true, message: form.confirmation, mode });

  const gfBody: Record<string, string> = {};
  for (const [name, value] of Object.entries(payload(form, values))) gfBody[name.replace(/\./g, "_")] = value;
  if (body.captcha) gfBody["g-recaptcha-response"] = body.captcha.slice(0, 4_000);

  const origin = wordpressOrigin();
  const self = request.headers.get("host");
  if (self && new URL(origin).host === self) {
    console.error(`[forms] WORDPRESS_ORIGIN (${origin}) is this site: give WordPress its own hostname`);
    return reply({ ok: false, message: FAIL }, 503);
  }

  const url = `${origin}/wp-json/gf/v2/forms/${form.id}/submissions${mode === "validate" ? "/validation" : ""}`;
  let data: { is_valid?: boolean; validation_messages?: Record<string, string>; confirmation_message?: string } | null = null;
  let status = 0;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "flagtoremember-site/1.0", "X-Forwarded-For": ip },
      body: JSON.stringify(gfBody),
      signal: AbortSignal.timeout(30_000),
    });
    status = res.status;
    data = await res.json().catch(() => null);
  } catch (err) {
    console.error(`[forms] ${form.id} → Gravity Forms unreachable: ${(err as Error).message}`);
    return reply({ ok: false, message: FAIL }, 502);
  }
  if (!data) {
    console.error(`[forms] ${form.id} → Gravity Forms HTTP ${status}, no JSON`);
    return reply({ ok: false, message: FAIL }, 502);
  }

  if (data.is_valid === false) {
    const known = new Set(form.fields.map((f) => String(f.id)));
    const fieldErrors: Errors = {};
    const other: string[] = [];
    for (const [fid, msg] of Object.entries(data.validation_messages ?? {})) {
      if (known.has(fid)) fieldErrors[fid] = msg;
      else other.push(msg);
    }
    // In validate mode the only acceptable "no" is the captcha the test could not solve.
    if (mode === "validate" && !Object.keys(fieldErrors).length && !body.captcha) {
      console.info(`[forms] ${form.id} → Gravity Forms validate: every field accepted (no reCAPTCHA token to check)`);
      return reply({ ok: true, message: form.confirmation, mode, captchaChecked: false });
    }
    console.warn(`[forms] ${form.id} rejected by Gravity Forms`, Object.keys(data.validation_messages ?? {}));
    const captchaOnly = !Object.keys(fieldErrors).length;
    return reply(
      {
        ok: false,
        errors: fieldErrors,
        page: Object.keys(fieldErrors).length ? firstErrorPage(form, fieldErrors) : undefined,
        message: captchaOnly ? "We couldn’t confirm you’re not a robot. Please press the button again. If it keeps happening, email anthony@flagtoremember.com." : other.join(" ") || undefined,
      },
      422,
    );
  }
  if (status >= 400) {
    console.error(`[forms] ${form.id} → Gravity Forms HTTP ${status}`);
    return reply({ ok: false, message: FAIL }, 502);
  }

  console.info(`[forms] ${form.id} → Gravity Forms ${mode ?? "saved"}`);
  return reply({ ok: true, message: form.confirmation, mode, captchaChecked: Boolean(body.captcha) });
}
