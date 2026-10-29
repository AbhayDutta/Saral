import React from "react";
import { LockIcon, CheckIcon } from "./Icons";

const PRINCIPLES = [
  {
    title: "No Central Database",
    description:
      "There is no Saral server harvesting your personal data. Everything runs strictly inside your browser sandbox.",
  },
  {
    title: "Keys Stored Locally",
    description:
      "Your Groq & OpenRouter API keys are saved exclusively in your browser's private local extension storage.",
  },
  {
    title: "Audio Discarded After Transcription",
    description:
      "Your voice audio is sent strictly for transcription and discarded. We never retain voice recordings.",
  },
  {
    title: "Human in the Loop",
    description:
      "Saral prepares and populates the fields, but will never press the submit button. You review and click.",
  },
];

export function PrivacyTrust() {
  return (
    <section id="privacy" className="py-24 sm:py-32 bg-black border-t border-white/[0.08] font-sf">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Manifesto */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-400 text-xs font-semibold border border-emerald-500/20 mb-4">
              <LockIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dignity & Privacy</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white leading-tight">
              Privacy is not a setting. <br />
              <span className="text-zinc-500 font-normal">
                It is our fundamental architecture.
              </span>
            </h2>

            <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
              When dealing with sensitive citizen paperwork—pensions, identity numbers, healthcare, and certificates—privacy isn&apos;t optional. Saral is engineered so that your sensitive credentials never leave your personal machine.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="px-2.5 py-1 bg-zinc-900 border border-white/[0.08] rounded-md shadow-2xs">
                Zero Trackers
              </span>
              <span className="px-2.5 py-1 bg-zinc-900 border border-white/[0.08] rounded-md shadow-2xs">
                Open Source (MIT)
              </span>
              <span className="px-2.5 py-1 bg-zinc-900 border border-white/[0.08] rounded-md shadow-2xs">
                Local-First Storage
              </span>
            </div>
          </div>

          {/* Right Column: Clean Grid of Guarantees */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                className="p-6 sm:p-7 rounded-3xl bg-zinc-950/70 border border-white/[0.08] shadow-xs hover:border-white/[0.16] hover:bg-zinc-900/40 transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-950/70 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <CheckIcon className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5 tracking-tight">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
