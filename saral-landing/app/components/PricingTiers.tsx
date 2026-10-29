import React from "react";
import { ArrowRightIcon, CheckIcon, EdgeIcon } from "./Icons";

export function PricingTiers() {
  return (
    <section id="pricing" className="py-24 sm:py-32 bg-black border-t border-white/8 font-sf">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-3 font-mono">
            Simple Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white leading-tight">
            Start free. Bring your own AI.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 font-normal leading-relaxed">
            Use free models for free, or unlock any provider and model you already have access to with BYOK.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-zinc-950 p-8 sm:p-10 transition-colors hover:border-white/20">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                  Free
                </span>
                <span className="text-[11px] font-mono font-semibold text-zinc-300 bg-white/6 px-2.5 py-0.5 rounded-full border border-white/10">
                  Free Forever
                </span>
              </div>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-sf">
                  $0
                </span>
                <span className="text-sm text-zinc-500 font-normal">/ forever</span>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed font-normal mb-8">
                Everything you need to fill forms by voice, powered only by free models.
              </p>

              <ul className="space-y-3.5 text-sm text-zinc-300 mb-9">
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Free Groq &amp; OpenRouter models only</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited form scans &amp; voice inputs</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Hindi, Hinglish &amp; English speech recognition</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automatic dates, phone &amp; email normalizer</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Audio explanation of confusing form sections</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Keys saved locally on your computer</span>
                </li>
              </ul>
            </div>

            <a
              href="https://github.com/AbhayDutta/Saral"
              className="mt-auto w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white border border-white/[0.14] bg-white/4 hover:bg-white/8 transition-colors"
            >
              <EdgeIcon className="w-4 h-4" />
              <span>Install Free</span>
            </a>
          </div>

          {/* BYOK Plan */}
          <div className="relative flex h-full flex-col rounded-3xl border border-emerald-500/30 bg-linear-to-b from-emerald-950/25 via-zinc-950 to-zinc-950 p-8 sm:p-10 shadow-[0_0_60px_-20px_rgba(52,211,153,0.35)]">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                  BYOK
                </span>
                <span className="text-[11px] font-mono font-semibold text-emerald-300 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Most Flexible
                </span>
              </div>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-sf">
                  $12
                </span>
                <span className="text-sm text-zinc-500 font-normal">/ month</span>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed font-normal mb-8">
                Bring any API key and use any model you already have access to.
              </p>

              <ul className="space-y-3.5 text-sm text-zinc-300 mb-9">
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Everything in Free, plus:</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bring any provider, model or compatible endpoint</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>OpenAI, Anthropic, Gemini, Groq, OpenRouter &amp; more</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No model restrictions or usage caps</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Premium-model accuracy and speed</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Keys stay in your browser, never on our servers</span>
                </li>
              </ul>
            </div>

            <a
              href="#install"
              className="mt-auto w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-black bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-[0_0_30px_rgba(52,211,153,0.25)]"
            >
              <span>Get BYOK — $12/mo</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          BYOK model usage is billed separately by the provider whose key you use. Saral never sees or stores your
          keys.
        </p>
      </div>
    </section>
  );
}
