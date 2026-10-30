import { required } from "./airtable";
import { previewTesting } from "./environment";

export async function verifyCaptcha(token: unknown) {
  const testing = previewTesting();
  const secret = required("RECAPTCHA_SECRET_KEY");
  if (!testing && secret === "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe") throw new Error("Test CAPTCHA cannot be used for real submissions");
  if (typeof token !== "string" || !token || token.length > 4_000) return false;
  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`reCAPTCHA HTTP ${response.status}`);
  const data = await response.json();
  const hosts = testing ? ["testkey.google.com"] :
    (process.env.RECAPTCHA_ALLOWED_HOSTNAMES || "flagtoremember.com,www.flagtoremember.com").split(",").map((h) => h.trim());
  return data.success === true && typeof data.hostname === "string" && hosts.includes(data.hostname);
}
