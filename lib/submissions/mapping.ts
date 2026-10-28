import { createHash } from "node:crypto";
import { getForm, payload, type Values } from "@/lib/forms/schema";

export const SUBMISSION_FIELD = "Website submission ID";
export const TABLES = {
  registry: "tblUT9mTyZ8XE3zB4",
  donations: "tbl0tL5ASXkyRKvyv",
  contact: "tbl6LDBTXdgEf5noo",
} as const;
export type Fields = Record<string, string | number>;
export interface RecordBatch { table: string; records: { fields: Fields }[] }
export interface Submission { id: string; formId: number; values: Values }
export interface Donation {
  id: string;
  email: string;
  name: string;
  phone: string;
  amountCents: number;
}

const groups = [
  [70, 18, 15, 16, 17], [71, 24, 21, 22, 23], [72, 31, 28, 29, 30],
  [73, 37, 34, 35, 36], [74, 43, 40, 41, 42],
];
const value = (v: Values, id: string | number) => v[`input_${id}`] ?? "";
const name = (v: Values, first: string, last: string) => [value(v, first), value(v, last)].filter(Boolean).join(" ");

/** Retries of the same entry share a key; editing an entry creates a new one. */
export function submission(formId: number, requestId: string, values: Values): Submission {
  const form = getForm(formId);
  if (!form) throw new Error("Unknown form");
  const clean = payload(form, values);
  const canonical = Object.entries(clean).sort(([a], [b]) => a.localeCompare(b));
  const hash = createHash("sha256").update(JSON.stringify([formId, requestId, canonical])).digest("hex");
  return { id: `website:${hash}`, formId, values: clean };
}

export function formBatches(s: Submission): RecordBatch[] {
  const v = s.values;
  const record = (fields: Fields, suffix = "") => ({ fields: { ...fields, [SUBMISSION_FIELD]: s.id + suffix } });
  if (s.formId === 6) return [{ table: TABLES.contact, records: [record({
    fldjKh2Mbg1DuDQoM: value(v, 1), fld2k2AINWX08ePdm: "Email List",
  })] }];
  if (s.formId === 8) return [{ table: TABLES.contact, records: [record({
    fldK2DwT349HfnpCJ: value(v, 1), fldjKh2Mbg1DuDQoM: value(v, 3),
    fld2k2AINWX08ePdm: value(v, 7), fld5QhQjWBNaMqpwW: value(v, 4), fldmIk42a21oSnJkG: value(v, 8),
  })] }];
  if (s.formId !== 5) throw new Error("Unknown form");
  const donorName = name(v, "6.3", "6.6");
  const names = groups.filter(([id]) => value(v, id));
  const donor: Fields = {
    fldVHdfvDnJ7ETHpp: donorName, fld2B2DM5khyIayFO: value(v, 7), fldNySwctGQPYr0po: value(v, 8),
    fldVyFu19uyLYF6du: value(v, "87.3"), fldbGDovSZ8q8v8fB: value(v, "87.4"),
    fldhWAZEp0ojuUkCr: value(v, "88.3"), fldPofkpkxMbqB5Kv: value(v, "88.4"),
    fldi5rMAoExMFFLkh: value(v, 90), fldFqwxTbRQJcvCKN: value(v, 100),
    fld71Hk8sFsMS0qmb: name(v, "101.3", "101.6"), fld9goKgBwRChn2xu: value(v, 102),
    fldfo2SB0rsefpcVW: value(v, 103), fldNDPtIfFDY7zBoE: value(v, 91),
    fldWjfbQY5GHVSapI: value(v, "93.3"), fldJZZPFDAiS9hYpa: value(v, "93.4"), fldfpywT4qFpkiQaX: value(v, 94),
  };
  return [
    { table: TABLES.donations, records: [record({
      fldz5f4dLfC3dUnaG: donorName, fld8bEmtpit9VRuCf: value(v, 7), fldT8ufTNE2qb8WmP: value(v, 8),
      fldeTD0iGayQpfNKy: 0, fldiDeBxioLEJGr4W: String(names.length),
      fld1hPYcXlVIRADmQ: names.map(([id]) => value(v, id)).join(", "),
      fld18hdItsKmbm2aV: value(v, "87.3"), fldhgf7ccXk1lc4c2: value(v, "87.4"),
      fldnwcIlJYAUHBgzS: value(v, "88.3"), fldVYR36EvYMDi1HW: value(v, "88.4"),
      fldoF3vhICJnSmHhI: value(v, 90), fldL08gAvP2kpcyHe: value(v, 100),
      flddBj3PMDEn5HmjC: name(v, "101.3", "101.6"), fldfQ0tXVu3du4YuV: value(v, 102),
      fldlYEBikpEPs68Sn: value(v, 103), fldTdrcpzDPzkgxl5: value(v, 91),
      fld2TRUxi3Si8z6m9: value(v, "93.3"), fldPzBymXyutmYUmB: value(v, "93.4"), fldlZafAooR0xZM7o: value(v, 94),
    })] },
    { table: TABLES.registry, records: names.map(([fallen, branch, material, cause, other]) => record({
      ...donor, fldtvDlwrhqs0drdf: value(v, fallen), fldaEu3Ho4D6tj7JO: value(v, branch),
      fldrC75A9q2Aftdq7: value(v, material), fldUD2kJwfhB0cFJ4: value(v, cause),
      ...(value(v, other) ? { flds0LQZx8kLb4zl8: value(v, other) } : {}),
    }, `:name:${fallen}`)) },
  ];
}

export function donationBatch(d: Donation): RecordBatch {
  return { table: TABLES.donations, records: [{ fields: {
    [SUBMISSION_FIELD]: `stripe:${d.id}`, fldz5f4dLfC3dUnaG: d.name, fldT8ufTNE2qb8WmP: d.email,
    fld8bEmtpit9VRuCf: d.phone, fldeTD0iGayQpfNKy: d.amountCents / 100, fldiDeBxioLEJGr4W: "0",
  } }] };
}
