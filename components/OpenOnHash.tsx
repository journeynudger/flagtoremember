"use client";

import { useEffect } from "react";

/** Opens the toggle a link points at (/flags#flag-002), on load and when the hash changes. */
export default function OpenOnHash() {
  useEffect(() => {
    const open = () => {
      const el = window.location.hash && document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (el instanceof HTMLDetailsElement) {
        el.open = true;
        el.scrollIntoView({ block: "start" });
      }
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
  return null;
}
