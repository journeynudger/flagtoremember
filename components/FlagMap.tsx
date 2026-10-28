"use client";

import Link from "next/link";
import { useState } from "react";
import mapData from "@/content/us-map.json";
import { flagAnchor, type Flag } from "@/lib/content";

const CODES: Record<string, string> = {
  "North Carolina": "nc", Florida: "fl", Georgia: "ga", California: "ca", Colorado: "co", Virginia: "va", Ohio: "oh",
};
const map = mapData as { viewBox: string; quiet: string[]; live: Record<string, string> };

/** The original home page map: pick a host state on the map or in the list to see its flags. */
export default function FlagMap({ states }: { states: { state: string; flags: Flag[] }[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const current = states.find((s) => s.state === selected);

  return (
    <div>
      <div className="flex flex-col-reverse gap-8 md:flex-row md:items-start">
        <div className="min-w-0 md:basis-[40%]" aria-live="polite">
          {!current ? (
            <p className="text-base text-muted sm:text-lg">Select a state to see its flags.</p>
          ) : (
            <div>
              <h3 className="text-2xl font-medium sm:text-[1.75rem]">{current.state}</h3>
              <p className="mt-0.5 text-sm uppercase tracking-[0.04em] text-muted">
                {current.flags.length} {current.flags.length === 1 ? "flag" : "flags"}
              </p>
              <ul className="mt-4 border-b border-[rgb(60_162_162/0.35)]">
                {current.flags.map((f) => (
                  <li key={f.number} className="border-t border-[rgb(60_162_162/0.35)]">
                    <details className="toggle">
                      <summary className="flex items-center gap-3 py-3 text-lg font-medium">
                        <span aria-hidden className="toggle__sign w-4 text-center" />
                        Flag {f.number}
                      </summary>
                      <dl className="space-y-1 pb-4 pl-7 text-base text-ink-2">
                        <div><dt className="inline font-medium text-ink">Hosted by: </dt><dd className="inline">{f.host}</dd></div>
                        <div><dt className="inline font-medium text-ink">Dedicated on: </dt><dd className="inline">{f.dedicated}</dd></div>
                        {f.memorial && (
                          <div><dt className="inline font-medium text-ink">In Memory of: </dt><dd className="inline">{f.memorial.name} ({f.memorial.lifespan})</dd></div>
                        )}
                        <div><dt className="inline font-medium text-ink">Location: </dt><dd className="inline">{f.city}</dd></div>
                        <div className="pt-1">
                          <Link href={`/flags#${flagAnchor(f.number)}`} className="text-teal-edge underline underline-offset-2">Flag details</Link>
                        </div>
                      </dl>
                    </details>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="min-w-0 md:basis-[60%]">
          <svg viewBox={map.viewBox} className="block h-auto w-full" role="group" aria-label={`Map of the United States. ${states.length} states host a Flag to Remember.`}>
            <g aria-hidden>
              {map.quiet.map((d, i) => (
                <path key={i} d={d} fill="#eceff1" stroke="#c6ced3" strokeWidth={1} strokeLinejoin="round" />
              ))}
            </g>
            {states.map(({ state, flags }) => {
              const d = map.live[CODES[state]];
              if (!d) return null;
              const on = state === selected;
              return (
                <path
                  key={state}
                  d={d}
                  role="button"
                  tabIndex={-1}
                  aria-label={`${state}, ${flags.length} ${flags.length === 1 ? "flag" : "flags"}`}
                  onClick={() => setSelected(on ? null : state)}
                  className="cursor-pointer transition-[fill] duration-150 hover:fill-[rgb(60_162_162/0.71)]"
                  fill={on ? "rgb(60 162 162 / 0.71)" : "rgb(60 162 162 / 0.22)"}
                  stroke="#235b6e"
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              );
            })}
          </svg>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-2" role="group" aria-label="Host states">
        {states.map(({ state, flags }) => {
          const on = state === selected;
          return (
            <button
              key={state}
              type="button"
              aria-pressed={on}
              onClick={() => setSelected(on ? null : state)}
              className={`inline-flex items-center gap-2 rounded-full border-2 border-teal-edge px-3.5 py-2 text-[15px] leading-tight transition-colors ${
                on ? "bg-teal-edge text-white" : "bg-transparent text-ink hover:bg-[rgb(60_162_162/0.18)]"
              }`}
            >
              {state}
              <span className={`inline-grid h-[22px] min-w-[22px] place-items-center rounded-full px-1.5 text-[13px] font-semibold ${on ? "bg-white/25" : "bg-[rgb(60_162_162/0.28)]"}`}>
                {flags.length}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
