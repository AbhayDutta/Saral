import React from "react";

const STEPS = [
  {
    step: "01",
    title: "Open form & hear it explained",
    titleHindi: "फॉर्म खोलें और समझें",
    description:
      "Navigate to any government, banking, or admission portal. Press ⌘+Shift+S (or Ctrl+Shift+S). Saral scans every input and explains what is needed in simple Hindi or English.",
    badge: "~150ms scan",
  },
  {
    step: "02",
    title: "Speak in your natural tongue",
    titleHindi: "अपनी भाषा में बोलें",
    description:
      "Speak conversationally in Hindi, Hinglish, or English. You don't have to follow a rigid script—mention your name, address, DOB, or phone number just like you would to a helpful clerk.",
    badge: "Groq Whisper V3",
  },
  {
    step: "03",
    title: "Review and fill with 1 tap",
    titleHindi: "जांचें और भरें",
    description:
      "Saral normalizes spoken dates ('15 अगस्त 1968' → '15/08/1968') and phone numbers. Review the neat summary, tap 'Fill form', and Saral populates the inputs on your screen.",
    badge: "Never auto-submits",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-black border-y border-white/[0.08] font-sf">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Section Heading */}
        <div className="max-w-2xl mb-16 sm:mb-20">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-3 font-mono">
            3-Step Workflow
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white leading-tight">
            How Saral works <br />
            <span className="text-zinc-500 font-normal">
              From spoken words to filled forms in seconds.
            </span>
          </h2>
        </div>

        {/* 3 Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className="relative flex flex-col justify-between p-8 sm:p-9 rounded-3xl bg-zinc-950/70 border border-white/[0.08] shadow-xs hover:border-white/[0.16] hover:bg-zinc-900/40 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-3xl font-light text-zinc-600">
                    {item.step}
                  </span>
                  <span className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-500 devanagari mb-4">
                  {item.titleHindi}
                </p>

                <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/[0.06] text-[11px] text-zinc-500 font-mono">
                Zero friction • Instant response
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
