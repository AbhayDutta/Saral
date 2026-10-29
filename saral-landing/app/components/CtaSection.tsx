import React from "react";
import { EdgeIcon, ArrowRightIcon } from "./Icons";

export function CtaSection() {
  return (
    <section id="install" className="py-24 sm:py-36 bg-black text-white relative overflow-hidden font-sf border-t border-white/8">
      {/* Subtle background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-20 top-0 h-96 -z-10 bg-radial from-emerald-500/15 via-zinc-900/40 to-transparent blur-3xl opacity-60"
      />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-zinc-300 text-xs font-semibold border border-zinc-800 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Ready in under 60 seconds</span>
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.035em] leading-[1.08] mb-6">
          Speak your answers. <br />
          <span className="text-emerald-400">Let Saral do the rest.</span>
        </h2>

        <p className="max-w-xl mx-auto text-base sm:text-lg text-zinc-400 font-normal leading-relaxed mb-10">
          Available on Edge and other Chromium browsers. 100% open source, privacy respecting, and free forever for every citizen.
        </p>

        {/* Primary Download Button */}
        <div className="flex items-center justify-center">
          <a
            href="https://github.com/AbhayDutta/Saral"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-semibold text-zinc-950 bg-white hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] cursor-pointer"
          >
            <EdgeIcon className="w-4 h-4" />
            <span>Install Saral for Edge</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
