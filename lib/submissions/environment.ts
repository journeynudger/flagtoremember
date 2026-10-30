export const PRODUCTION_BASE = "appz2rK239E1b3rXD";

/** Test side effects are confined to a separate Vercel preview and Airtable base. */
export function previewTesting(): boolean {
  if (process.env.FTR_INTEGRATION_TEST !== "true") return false;
  const base = process.env.AIRTABLE_BASE_ID;
  if (process.env.VERCEL_ENV !== "preview" || !base || base === PRODUCTION_BASE) {
    throw new Error("Integration tests require an isolated preview base");
  }
  return true;
}

export function assertDataEnvironment() {
  const testing = previewTesting();
  if (process.env.VERCEL_ENV === "preview" && !testing) throw new Error("Preview writes require test isolation");
  if (process.env.VERCEL_ENV === "production" &&
      process.env.AIRTABLE_BASE_ID && process.env.AIRTABLE_BASE_ID !== PRODUCTION_BASE) {
    throw new Error("Production Airtable base does not match Flag");
  }
}
