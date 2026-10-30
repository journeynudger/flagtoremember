import { SUBMISSION_FIELD, type RecordBatch } from "./mapping";
import { assertDataEnvironment, previewTesting, PRODUCTION_BASE } from "./environment";

export function required(key: string): string {
  const result = process.env[key];
  if (!result) throw new Error(`Missing configuration: ${key}`);
  return result;
}

/** Upserts make a retry safe even if Airtable saved a response we never received. */
export async function saveBatch(batch: RecordBatch) {
  if (!batch.records.length) return;
  assertDataEnvironment();
  const base = process.env.AIRTABLE_BASE_ID || PRODUCTION_BASE;
  let destination = batch;
  if (previewTesting() && batch.table !== process.env.FTR_TEST_OUTBOX_TABLE) {
    const schema = JSON.parse(required("AIRTABLE_TEST_SCHEMA_MAP")) as Record<string, { tableId: string; fields: Record<string, string> }>;
    const map = schema[batch.table];
    if (!map || !/^tbl\w{14}$/.test(map.tableId)) throw new Error("Missing test table mapping");
    destination = { table: map.tableId, records: batch.records.map(({ fields }) => ({ fields: Object.fromEntries(
      Object.entries(fields).map(([key, value]) => {
        if (key === SUBMISSION_FIELD) return [key, value];
        if (!map.fields[key]) throw new Error("Missing test field mapping");
        return [map.fields[key], value];
      }),
    ) })) };
  }
  const response = await fetch(`https://api.airtable.com/v0/${base}/${destination.table}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${required("AIRTABLE_TOKEN")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ records: destination.records, performUpsert: { fieldsToMergeOn: [SUBMISSION_FIELD] }, typecast: true }),
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
