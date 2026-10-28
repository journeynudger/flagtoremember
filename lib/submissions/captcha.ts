import { required } from "./airtable";

export async function verifyCaptcha(token: unknown) {
  if (typeof token !== "string" || !token || token.length > 4_000) return false;
  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: required("RECAPTCHA_SECRET_KEY"), response: token }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`reCAPTCHA HTTP ${response.status}`);
  const data = await response.json();
  const hosts = (process.env.RECAPTCHA_ALLOWED_HOSTNAMES || "flagtoremember.com,www.flagtoremember.com").split(",").map((h) => h.trim());
  return data.success === true && typeof data.hostname === "string" && hosts.includes(data.hostname);
}
