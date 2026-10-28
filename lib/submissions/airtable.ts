import { SUBMISSION_FIELD, type RecordBatch } from "./mapping";

export function required(key: string): string {
  const result = process.env[key];
  if (!result) throw new Error(`Missing configuration: ${key}`);
  return result;
}

/** Upserts make a retry safe even if Airtable saved a response we never received. */
export async function saveBatch(batch: RecordBatch) {
  if (!batch.records.length) return;
  const base = process.env.AIRTABLE_BASE_ID || "appz2rK239E1b3rXD";
  const response = await fetch(`https://api.airtable.com/v0/${base}/${batch.table}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${required("AIRTABLE_TOKEN")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ records: batch.records, performUpsert: { fieldsToMergeOn: [SUBMISSION_FIELD] }, typecast: true }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    // Responses can contain personal data: log only the status and table.
    throw new Error(`Airtable ${batch.table} HTTP ${response.status}`);
  }
  const result = await response.json();
  if (!Array.isArray(result.records) || result.records.length !== batch.records.length) {
    throw new Error(`Airtable ${batch.table}: incomplete save`);
  }
}
