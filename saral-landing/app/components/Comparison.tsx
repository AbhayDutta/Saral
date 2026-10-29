import React from "react";
import { CheckIcon } from "./Icons";

export function Comparison() {
  return (
    <section className="py-24 sm:py-32 bg-black font-sf">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-3 font-mono">
            Why It Matters
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white leading-tight">
            The traditional way is broken. <br />
            <span className="text-zinc-500 font-normal">Saral makes it effortless.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 font-normal leading-relaxed">
            See the difference between struggling with tiny mobile keypads versus speaking naturally.
          </p>
        </div>

        {/* 2-Column Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: Old Way */}
          <div className="p-8 sm:p-10 rounded-3xl bg-zinc-950/60 border border-white/8 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/6 text-zinc-400 text-xs font-medium mb-6">
                <span>The Traditional Struggle</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-6">
                Without Saral
              </h3>

              <ul className="space-y-4 text-sm text-zinc-400">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-zinc-900 border border-white/8 text-zinc-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✕
                  </span>
                  <span>
                    <strong className="text-zinc-200">Clumsy typing:</strong> Hunting and pecking 25+ fields on keyboards, especially difficult for senior citizens.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-zinc-900 border border-white/8 text-zinc-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✕
                  </span>
                  <span>
                    <strong className="text-zinc-200">Cryptic English jargon:</strong> Confusing administrative terms causing anxiety and mistaken entries.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-zinc-900 border border-white/8 text-zinc-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✕
                  </span>
                  <span>
                    <strong className="text-zinc-200">Format rejections:</strong> Constant validation errors for date slashes, missing country codes, or invalid characters.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-zinc-900 border border-white/8 text-zinc-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✕
                  </span>
                  <span>
                    <strong className="text-zinc-200">Cyber café dependence:</strong> Waiting in long queues and paying ₹50–₹100 just to submit a basic application.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-white/6 text-xs text-zinc-500">
              Average time: 15–25 minutes of friction
            </div>
          </div>

          {/* Card 2: With Saral */}
          <div className="p-8 sm:p-10 rounded-3xl bg-zinc-950 border-2 border-emerald-500/60 shadow-[0_0_60px_-15px_rgba(16,185,129,0.25)] flex flex-col justify-between relative">
            <div className="absolute top-6 right-6">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-semibold shadow-xs">
                Recommended
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 text-xs font-medium mb-6">
                <span>The Voice-First Standard</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-6">
                With Saral (सरल)
              </h3>

              <ul className="space-y-4 text-sm text-zinc-300">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckIcon className="w-3.5 h-3.5" />
                  </span>
                  <span>
                    <strong className="text-white">Spoken conversation:</strong> Speak at your own speed in Hindi, Hinglish, or English.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckIcon className="w-3.5 h-3.5" />
                  </span>
                  <span>
                    <strong className="text-white">Audio explanation in Hindi:</strong> Saral explains each section aloud so you understand exactly what to say.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckIcon className="w-3.5 h-3.5" />
                  </span>
                  <span>
                    <strong className="text-white">Zero-error normalization:</strong> Dates, phone numbers, and currency values are formatted to exact portal rules.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckIcon className="w-3.5 h-3.5" />
                  </span>
                  <span>
                    <strong className="text-white">Total independence:</strong> 100% free and open-source. Fill forms right from home with complete dignity.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-400 font-medium">
              <span>Average time: ~30 seconds</span>
              <span>100% Client-side privacy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
