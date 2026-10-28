"use client";

/**
 * Google's invisible reCAPTCHA, which Gravity Forms checks on every submission.
 * The script loads on the first interaction with a form, not on page load.
 */

type Grecaptcha = {
  render: (el: HTMLElement, opts: object) => number;
  execute: (id: number) => void;
  reset: (id: number) => void;
  ready: (cb: () => void) => void;
};
const g = () => (window as unknown as { grecaptcha?: Grecaptcha }).grecaptcha;

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    s.async = true;
    s.onload = () => g()?.ready(() => resolve());
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("reCAPTCHA failed to load"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export interface Captcha { token(): Promise<string | undefined> }

/** Render an invisible widget into `box`. Never rejects: on any failure token() gives undefined. */
export async function mountCaptcha(box: HTMLElement, siteKey: string): Promise<Captcha> {
  try {
    await loadScript();
  } catch {
    return { token: async () => undefined };
  }
  let settle: ((t: string | undefined) => void) | null = null;
  const id = g()!.render(box, {
    sitekey: siteKey,
    size: "invisible",
    badge: "inline",
    callback: (t: string) => settle?.(t),
    "error-callback": () => settle?.(undefined),
    "expired-callback": () => settle?.(undefined),
  });
  return {
    token: () =>
      new Promise((resolve) => {
        // A picture challenge can take a while; give up after two minutes.
        const timer = window.setTimeout(() => finish(undefined), 120_000);
        const finish = (t: string | undefined) => {
          window.clearTimeout(timer);
          settle = null;
          resolve(t);
        };
        settle = finish;
        try {
          g()!.reset(id);
          g()!.execute(id);
        } catch {
          finish(undefined);
        }
      }),
  };
}
