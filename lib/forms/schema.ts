import addNameForm from "@/content/forms/add-name.json";
import contactForm from "@/content/forms/contact.json";
import newsletterForm from "@/content/forms/newsletter.json";

/**
 * The site's three Gravity Forms, as plain data (content/forms/*.json). The same
 * definitions drive the browser form and the /api/forms route, so the rules
 * someone sees are the rules the server applies. Field ids, input names and
 * option values are Gravity Forms' own and must not change: it stores them as sent.
 */

/** Show the field when `field`'s value is one of `in` (and, when given, `and` also holds). */
export interface ShowIf { field: number; in: string[]; and?: ShowIf }

export interface SubInput { name: string; label: string; autocomplete?: string; options?: string }

export interface Field {
  id: number;
  type: "text" | "email" | "phone" | "select" | "textarea" | "radio" | "name" | "address";
  label: string;
  page?: number;
  group?: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  autocomplete?: string;
  maxLength?: number;
  /** a list, or the name of one of the form's optionSets */
  options?: string[] | string;
  inputs?: SubInput[];
  showIf?: ShowIf;
}

export interface FormDef {
  id: number;
  title: string;
  captcha: boolean;
  pages?: { title: string; intro: string }[];
  /** Sent with every submission (see the form file's _fixed note). */
  fixed?: Record<string, string>;
  optionSets?: Record<string, string[]>;
  fields: Field[];
  submitLabel: string;
  confirmation: string;
}

export type Values = Record<string, string>;
export type Errors = Record<string, string>;

const forms: Record<number, FormDef> = {};
for (const f of [addNameForm, contactForm, newsletterForm] as FormDef[]) forms[f.id] = f;

export const getForm = (id: number): FormDef | undefined => forms[id];
export const addNameDef = forms[5];
export const contactDef = forms[8];
export const newsletterDef = forms[6];

export const RECAPTCHA_SITE_KEY = "6LfgWxIeAAAAAOMXDjGX4OKzIWLC7OvLfyk1sMc9";

/** The input names one field owns. */
export const inputNames = (f: Field) => (f.inputs ? f.inputs.map((i) => i.name) : [`input_${f.id}`]);

export function optionsFor(form: FormDef, options: string[] | string | undefined): string[] {
  if (!options) return [];
  if (Array.isArray(options)) return options;
  const set = form.optionSets?.[options];
  if (!set) throw new Error(`form ${form.id}: unknown option set "${options}"`);
  return set;
}

function holds(rule: ShowIf, values: Values): boolean {
  return rule.in.includes(values[`input_${rule.field}`] ?? "") && (!rule.and || holds(rule.and, values));
}

export const isVisible = (f: Field, values: Values) => !f.showIf || holds(f.showIf, values);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Gravity Forms' "standard" phone format: a US number, ten digits. */
export const phoneDigits = (v: string) => v.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
export function formatPhone(v: string): string {
  const d = phoneDigits(v);
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : v;
}

/** One field's problem, or null. Hidden fields never have one. */
export function fieldError(form: FormDef, f: Field, values: Values): string | null {
  if (!isVisible(f, values)) return null;
  const names = inputNames(f);
  const vals = names.map((n) => (values[n] ?? "").trim());
  if (f.required && vals.some((v) => !v)) {
    if (f.inputs) {
      const missing = f.inputs.filter((_, i) => !vals[i]).map((i) => i.label);
      return `This field is required. Please complete: ${missing.join(", ")}.`;
    }
    return f.type === "select" || f.type === "radio" ? "Please choose an option." : "This field is required.";
  }
  const v = vals[0];
  if (!v) return null;
  if (f.type === "email" && !EMAIL.test(v)) return "Please enter a valid email address, like name@example.com.";
  if (f.type === "phone" && phoneDigits(v).length !== 10) return "Please enter a 10-digit phone number, like (910) 555-0123.";
  if (f.maxLength && v.length > f.maxLength) return `Use ${f.maxLength} characters or fewer (now ${v.length}).`;
  if (f.type === "select" || f.type === "radio") {
    if (!optionsFor(form, f.options).includes(v)) return "Please choose one of the options.";
  }
  if (f.inputs) {
    for (const [i, input] of f.inputs.entries()) {
      if (input.options && vals[i] && !optionsFor(form, input.options).includes(vals[i])) return `Please choose a ${input.label.toLowerCase()}.`;
    }
  }
  return null;
}

/** Problems on the given page (or the whole form), keyed by field id. */
export function validate(form: FormDef, values: Values, page?: number): Errors {
  const errors: Errors = {};
  for (const f of form.fields) {
    if (page !== undefined && (f.page ?? 1) !== page) continue;
    const e = fieldError(form, f, values);
    if (e) errors[String(f.id)] = e;
  }
  return errors;
}

/** Only what Gravity Forms should receive: visible fields' inputs, trimmed, plus the fixed values. */
export function payload(form: FormDef, values: Values): Values {
  const out: Values = { ...(form.fixed ?? {}) };
  for (const f of form.fields) {
    if (!isVisible(f, values)) continue;
    for (const n of inputNames(f)) {
      let v = (values[n] ?? "").trim();
      if (f.type === "phone") v = formatPhone(v);
      if (v) out[n] = v;
    }
  }
  return out;
}

export const pageOf = (form: FormDef, fieldId: string) => form.fields.find((f) => String(f.id) === fieldId)?.page ?? 1;
/** The earliest page holding one of these errors. */
export const firstErrorPage = (form: FormDef, errors: Errors) => Math.min(...Object.keys(errors).map((id) => pageOf(form, id)));
