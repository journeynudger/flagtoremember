"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  fieldError,
  formatPhone,
  isVisible,
  optionsFor,
  RECAPTCHA_SITE_KEY,
  validate,
  type Errors,
  type Field,
  type FormDef,
  type Values,
} from "@/lib/forms/schema";
import { mountCaptcha, type Captcha } from "./recaptcha";

type Status = "idle" | "sending" | "done";

interface Props {
  def: FormDef;
  /** Extra content shown above a page's fields, by page number. */
  pageContent?: Record<number, ReactNode>;
  /** Shown under the confirmation message. */
  afterSuccess?: ReactNode;
  /** Compact single-line layout (footer signup). */
  inline?: boolean;
  tone?: "light" | "dark";
}

const inputCls =
  "block w-full min-w-0 rounded-md border border-line bg-white px-3.5 py-3 text-base text-ink shadow-[inset_0_1px_1px_rgb(0_0_0/0.04)] placeholder:text-muted/80 transition-colors focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/25 aria-[invalid=true]:border-red aria-[invalid=true]:ring-red/20";

export default function Form({ def, pageContent, afterSuccess, inline = false, tone = "light" }: Props) {
  const uid = useId();
  const pages = def.pages?.length ?? 1;
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Errors>({});
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState(false);
  const [hp, setHp] = useState("");
  const startedAt = useRef(0);
  const captcha = useRef<Promise<Captcha> | null>(null);
  const captchaBox = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const movedPage = useRef(false);

  const fid = (f: Field | number) => `${uid}-f${typeof f === "number" ? f : f.id}`;

  function warmUp() {
    if (!startedAt.current) startedAt.current = Date.now();
    if (def.captcha && !captcha.current && captchaBox.current) {
      captcha.current = mountCaptcha(captchaBox.current, RECAPTCHA_SITE_KEY);
    }
  }

  useEffect(() => {
    if (movedPage.current) headingRef.current?.focus();
  }, [page]);
  useEffect(() => {
    if (status === "done") doneRef.current?.focus();
  }, [status]);
  useEffect(() => {
    if (summary) summaryRef.current?.focus();
  }, [summary, errors]);

  function set(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  // After the first attempt a field's message updates as it is corrected.
  function recheck(f: Field, next: Values) {
    if (!(String(f.id) in errors)) return;
    const e = fieldError(def, f, next);
    setErrors((prev) => {
      const copy = { ...prev };
      if (e) copy[String(f.id)] = e;
      else delete copy[String(f.id)];
      return copy;
    });
  }

  function change(f: Field, name: string, value: string) {
    const next = { ...values, [name]: value };
    set(name, value);
    recheck(f, next);
  }

  function showErrors(errs: Errors, onPage?: number) {
    setErrors(errs);
    if (onPage && onPage !== page) {
      movedPage.current = true;
      setPage(onPage);
    }
    setSummary(Object.keys(errs).length > 0);
  }

  function next() {
    const errs = validate(def, values, page);
    if (Object.keys(errs).length) return showErrors(errs);
    setErrors({});
    setSummary(false);
    movedPage.current = true;
    setPage((p) => p + 1);
  }

  function back() {
    setErrors({});
    setSummary(false);
    movedPage.current = true;
    setPage((p) => p - 1);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    warmUp();
    if (page < pages) return next();
    const errs = validate(def, values);
    if (Object.keys(errs).length) {
      const first = def.fields.find((f) => String(f.id) in errs);
      return showErrors(errs, first?.page ?? 1);
    }
    setStatus("sending");
    setMessage(null);
    setSummary(false);
    let token: string | undefined;
    if (def.captcha && captcha.current) token = await (await captcha.current).token();
    try {
      const res = await fetch(`/api/forms/${def.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values, captcha: token, hp, startedAt: startedAt.current }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("done");
        setMessage(data.message);
        return;
      }
      setStatus("idle");
      setMessage(data.message ?? null);
      showErrors(data.errors ?? {}, data.page);
      if (!data.errors || !Object.keys(data.errors).length) setSummary(true);
    } catch {
      setStatus("idle");
      setMessage("We couldn’t reach the server. Check your connection and try again.");
      setSummary(true);
    }
  }

  if (status === "done") {
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className={`rounded-lg outline-none ${inline ? "" : "border border-line bg-white p-6 sm:p-8"}`}>
        <p className={`font-serif ${inline ? "text-lg" : "text-2xl"} ${tone === "dark" ? "text-paper" : "text-ink"}`}>{message}</p>
        {afterSuccess && <div className="mt-5">{afterSuccess}</div>}
      </div>
    );
  }

  const visible = def.fields.filter((f) => (f.page ?? 1) === page && isVisible(f, values));
  // In form order: numeric object keys would otherwise come back sorted by id.
  const errorList = def.fields.filter((f) => String(f.id) in errors).map((f) => [String(f.id), errors[String(f.id)]] as const);
  const sending = status === "sending";

  const disclosure = (
    <p className={`text-xs leading-relaxed ${tone === "dark" ? "text-paper/70" : "text-muted"}`}>
      Protected by reCAPTCHA. Google’s{" "}
      <a className="underline underline-offset-2" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>{" "}
      and{" "}
      <a className="underline underline-offset-2" href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>{" "}
      apply.
    </p>
  );

  const honeypot = (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this empty
        <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} name="website" />
      </label>
    </div>
  );

  if (inline) {
    const f = def.fields[0];
    const err = errors[String(f.id)];
    return (
      <form noValidate onSubmit={submit} onFocus={warmUp} className="relative">
        {honeypot}
        <label htmlFor={fid(f)} className="sr-only">{f.label}</label>
        <div className="flex gap-2">
          <input
            id={fid(f)}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={f.placeholder}
            value={values[`input_${f.id}`] ?? ""}
            onChange={(e) => change(f, `input_${f.id}`, e.target.value)}
            aria-invalid={err ? true : undefined}
            aria-describedby={err ? `${fid(f)}-err` : undefined}
            className={`${inputCls} py-2.5`}
          />
          <button
            type="submit"
            disabled={sending}
            className="shrink-0 rounded-md bg-gold px-4 py-2.5 font-semibold text-ink transition-colors hover:bg-gold-soft disabled:opacity-60"
          >
            {sending ? "Sending…" : def.submitLabel}
          </button>
        </div>
        <div aria-live="polite">
          {err && <p id={`${fid(f)}-err`} className="mt-2 text-sm font-medium text-gold-soft">{err}</p>}
          {!err && message && <p className="mt-2 text-sm font-medium text-gold-soft">{message}</p>}
        </div>
        <div ref={captchaBox} className="hidden" />
        <div className="mt-3">{disclosure}</div>
      </form>
    );
  }

  // Fields on a page, with "Name 1", "Name 2"… groups drawn as their own cards.
  const blocks: { group?: string; fields: Field[] }[] = [];
  for (const f of visible) {
    const last = blocks[blocks.length - 1];
    if (f.group && last?.group === f.group) last.fields.push(f);
    else blocks.push({ group: f.group, fields: [f] });
  }

  return (
    <form noValidate onSubmit={submit} onFocus={warmUp} className="relative" aria-busy={sending}>
      {honeypot}
      {pages > 1 && (
        <ol className="mb-8 grid grid-cols-3 gap-2" aria-label="Progress">
          {def.pages!.map((p, i) => (
            <li key={p.title} aria-current={i + 1 === page ? "step" : undefined}>
              <span className={`block h-1 rounded-full ${i + 1 <= page ? "bg-navy" : "bg-line"}`} />
              <span className={`mt-2 hidden text-xs font-medium uppercase tracking-[0.14em] sm:block ${i + 1 === page ? "text-navy" : "text-muted"}`}>
                {p.title}
              </span>
            </li>
          ))}
        </ol>
      )}

      {pages > 1 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-muted">Step {page} of {pages}</p>
          <h2 ref={headingRef} tabIndex={-1} className="mt-1 font-serif text-2xl text-ink outline-none sm:text-3xl">
            {def.pages![page - 1].title}
          </h2>
          <p className="mt-2 text-muted">{def.pages![page - 1].intro}</p>
        </div>
      )}

      {summary && (errorList.length > 0 || message) && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="mb-6 rounded-md border-l-4 border-red bg-red/5 p-4 outline-none">
          <p className="font-semibold text-red">
            {errorList.length ? `Please fix ${errorList.length === 1 ? "this" : `these ${errorList.length}`} before continuing:` : message}
          </p>
          {errorList.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {errorList.map(([id, msg]) => {
                const f = def.fields.find((x) => String(x.id) === id);
                return (
                  <li key={id}>
                    <a href={`#${fid(Number(id))}`} className="underline underline-offset-2">
                      {f?.group ? `${f.group}: ` : ""}
                      {f?.label ?? "Field"}
                    </a>{" "}
                    — {msg}
                  </li>
                );
              })}
            </ul>
          )}
          {errorList.length > 0 && message && <p className="mt-2 text-sm">{message}</p>}
        </div>
      )}

      {pageContent?.[page]}

      <div className="space-y-6">
        {blocks.map((b, i) =>
          b.group ? (
            <fieldset key={b.group} className="rounded-lg border border-line bg-white p-5 sm:p-6">
              <legend className="px-2 font-serif text-lg text-ink">{b.group}</legend>
              <div className="grid gap-5 sm:grid-cols-2">
                {b.fields.map((f) => (
                  <div key={f.id} className={f.type === "text" ? "sm:col-span-2" : ""}>
                    {renderField(f)}
                  </div>
                ))}
              </div>
            </fieldset>
          ) : (
            <div key={i} className="space-y-6">
              {b.fields.map((f) => (
                <div key={f.id}>{renderField(f)}</div>
              ))}
            </div>
          ),
        )}
      </div>

      <div ref={captchaBox} className="hidden" />

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        {page > 1 && (
          <button type="button" onClick={back} disabled={sending} className="rounded-md border border-line bg-white px-5 py-3 font-semibold text-ink transition-colors hover:border-navy">
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={sending}
          className="inline-flex min-w-40 items-center justify-center gap-2 rounded-md bg-navy px-6 py-3 font-semibold text-paper transition-colors hover:bg-navy-deep disabled:opacity-70"
        >
          {sending && <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-paper/40 border-t-paper" />}
          {sending ? "Sending…" : page < pages ? "Continue" : def.submitLabel}
        </button>
      </div>
      {def.captcha && page === pages && <div className="mt-4">{disclosure}</div>}
    </form>
  );

  function renderField(f: Field) {
    const id = fid(f);
    const err = errors[String(f.id)];
    const describedBy = [f.description && `${id}-desc`, f.maxLength && `${id}-count`, err && `${id}-err`].filter(Boolean).join(" ") || undefined;
    const label = (
      <>
        {f.label}
        {f.required && <span className="ml-1.5 text-xs font-normal uppercase tracking-wide text-muted">Required</span>}
      </>
    );
    const desc = f.description && <p id={`${id}-desc`} className="mt-1 text-sm text-muted">{f.description}</p>;
    const error = err && (
      <p id={`${id}-err`} className="mt-2 flex gap-1.5 text-sm font-medium text-red">
        <span aria-hidden>!</span>
        {err}
      </p>
    );
    const value = (name: string) => values[name] ?? "";
    const common = { "aria-invalid": err ? true : undefined, "aria-describedby": describedBy, "aria-required": f.required || undefined };

    if (f.type === "radio") {
      const opts = optionsFor(def, f.options);
      return (
        <fieldset aria-describedby={describedBy} aria-invalid={err ? true : undefined}>
          <legend className="font-medium text-ink">{label}</legend>
          {desc}
          <div className="mt-3 flex flex-wrap gap-3" id={id} tabIndex={-1}>
            {opts.map((o) => (
              <label key={o} className="flex cursor-pointer items-center gap-2.5 rounded-md border border-line bg-white px-4 py-2.5 has-checked:border-navy has-checked:bg-navy/5">
                <input
                  type="radio"
                  name={`${id}-r`}
                  value={o}
                  checked={value(`input_${f.id}`) === o}
                  onChange={() => change(f, `input_${f.id}`, o)}
                  className="size-4 accent-navy"
                />
                <span>{o}</span>
              </label>
            ))}
          </div>
          {error}
        </fieldset>
      );
    }

    if (f.inputs) {
      return (
        <fieldset aria-describedby={describedBy}>
          <legend className="font-medium text-ink">{label}</legend>
          {desc}
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {f.inputs.map((input, i) => {
              const sid = i === 0 ? id : `${id}-${i}`;
              const missing = err && !value(input.name).trim();
              return (
                <div key={input.name}>
                  <label htmlFor={sid} className="mb-1 block text-sm text-muted">{input.label}</label>
                  {input.options ? (
                    <select
                      id={sid}
                      value={value(input.name)}
                      onChange={(e) => change(f, input.name, e.target.value)}
                      aria-invalid={missing ? true : undefined}
                      aria-describedby={err ? `${id}-err` : undefined}
                      className={inputCls}
                    >
                      <option value="">Select a state</option>
                      {optionsFor(def, input.options).map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={sid}
                      type="text"
                      autoComplete={input.autocomplete}
                      value={value(input.name)}
                      onChange={(e) => change(f, input.name, e.target.value)}
                      aria-invalid={missing ? true : undefined}
                      aria-describedby={err ? `${id}-err` : undefined}
                      className={inputCls}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {error}
        </fieldset>
      );
    }

    const name = `input_${f.id}`;
    let control: ReactNode;
    if (f.type === "select") {
      control = (
        <select id={id} value={value(name)} onChange={(e) => change(f, name, e.target.value)} className={inputCls} {...common}>
          <option value="">{f.placeholder ?? "Select…"}</option>
          {optionsFor(def, f.options).map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      );
    } else if (f.type === "textarea") {
      control = <textarea id={id} rows={5} value={value(name)} onChange={(e) => change(f, name, e.target.value)} className={inputCls} {...common} />;
    } else {
      const type = f.type === "email" ? "email" : f.type === "phone" ? "tel" : "text";
      control = (
        <input
          id={id}
          type={type}
          inputMode={f.type === "email" ? "email" : f.type === "phone" ? "tel" : undefined}
          autoComplete={f.autocomplete ?? (f.type === "email" ? "email" : f.type === "phone" ? "tel-national" : "off")}
          placeholder={f.placeholder}
          maxLength={f.maxLength}
          value={value(name)}
          onChange={(e) => change(f, name, e.target.value)}
          onBlur={f.type === "phone" ? (e) => change(f, name, formatPhone(e.target.value)) : undefined}
          className={`${inputCls} ${f.maxLength ? "font-mono tracking-wide" : ""}`}
          {...common}
        />
      );
    }
    return (
      <>
        <label htmlFor={id} className="block font-medium text-ink">{label}</label>
        {desc}
        <div className="mt-2">{control}</div>
        {f.maxLength && (
          <p id={`${id}-count`} className="mt-1.5 text-right text-xs tabular-nums text-muted" aria-live="polite">
            {value(name).length} of {f.maxLength} characters
          </p>
        )}
        {error}
      </>
    );
  }
}
