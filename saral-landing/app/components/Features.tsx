import React from "react";
import {
  MicIcon,
  GlobeIcon,
  ShieldIcon,
  SpeakerIcon,
  FileTextIcon,
  SparklesIcon,
} from "./Icons";

const FEATURES = [
  {
    icon: GlobeIcon,
    title: "Hindi, Hinglish & English",
    titleHindi: "मातृभाषा में बातचीत",
    description:
      "Speak naturally in your preferred dialect. Saral handles code-switching between Hindi and English seamlessly with Whisper AI speech-to-text.",
  },
  {
    icon: SparklesIcon,
    title: "Intelligent Normalization",
    titleHindi: "स्वचालित सुधार व प्रारूप",
    description:
      "Spoken dates, 10-digit mobile numbers, currency words ('दो लाख पचास हज़ार'), and spoken emails are parsed into the exact formats portals demand.",
  },
  {
    icon: SpeakerIcon,
    title: "Spoken Form Explanations",
    titleHindi: "बोलकर समझाने की सुविधा",
    description:
      "Stuck on dense bureaucratic terminology? Saral synthesizes simple audio explanations in Hindi so you understand exactly why each field is needed.",
  },
  {
    icon: FileTextIcon,
    title: "Universal Form Scanner",
    titleHindi: "हर वेबसाइट पर काम करता है",
    description:
      "Works across modern and legacy portals. Maps inputs, selects, dropdowns, radio groups, and textareas without requiring websites to change their code.",
  },
  {
    icon: ShieldIcon,
    title: "Zero Auto-Submit Guarantee",
    titleHindi: "सुरक्षा एवं नियंत्रण आपके हाथ",
    description:
      "You always remain in total control. Saral neatly highlights filled fields on the page. The final review and 'Submit' click is always yours.",
  },
  {
    icon: MicIcon,
    title: "Local & Private by Design",
    titleHindi: "निजी और सुरक्षित",
    description:
      "Your API keys reside in your browser's local sandbox. No audio recordings, personal records, or telemetry are ever retained on external servers.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-16 sm:mb-20">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 block mb-3">
            Designed for Accessibility
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950 font-sans leading-tight">
            Built for real people, <br />
            <span className="text-zinc-600 font-normal">
              not just power users.
            </span>
          </h2>
          <p className="mt-4 text-base text-zinc-600 leading-relaxed font-normal">
            Millions struggle with digital literacy when applying for scholarships, pensions, passports, or certificates. Saral removes the barrier of typing and confusing instructions.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group p-6 rounded-2xl border border-zinc-100 hover:border-zinc-200/80 bg-white hover:bg-zinc-50/50 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center mb-5 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-base font-semibold text-zinc-950 mb-0.5 font-sans">
                  {f.title}
                </h3>
                <span className="text-xs text-zinc-600 devanagari block mb-2.5">
                  {f.titleHindi}
                </span>

                <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

