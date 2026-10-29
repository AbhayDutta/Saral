"use client";

import React, { useState } from "react";
import { ChevronDownIcon } from "./Icons";

const FAQS = [
  {
    q: "Does Saral work on any website?",
    a: "Yes. Saral uses an intelligent DOM scanner that detects standard input fields, dropdown menus, radio buttons, checkboxes, and text areas across virtually any web application, government portal, or bank site without requiring any integration or changes from the site owners.",
  },
  {
    q: "Which languages and dialects are supported?",
    a: "Saral is tuned specifically for Indian languages starting with Hindi, Hinglish (code-mixed Hindi & English), and Indian English. It uses Groq Whisper which auto-detects language in real time, so you can speak conversationally without switching settings.",
  },
  {
    q: "Will Saral automatically submit the form?",
    a: "No, never. This is a core safety principle. Saral fills the form inputs and places an emerald indicator next to matched fields. You review every filled value on the screen and press the final submit button yourself.",
  },
  {
    q: "What API keys do I need to set up?",
    a: "The free plan uses Groq for speech transcription (Whisper Large V3) and OpenRouter for language extraction and form explanation. Both providers offer free models. With BYOK ($12/month), you can bring a key from any provider or compatible endpoint — OpenAI, Anthropic, Gemini, Groq, OpenRouter and more. Your keys are saved directly in your browser's local extension storage.",
  },
  {
    q: "Is Saral free and open-source?",
    a: "Yes. The free plan is free forever, licensed under the permissive MIT license, and open-source on GitHub. Anyone can audit the code, run it locally, or contribute improvements. BYOK is an optional $12/month plan for people who want to bring their own premium models.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 sm:py-32 bg-black border-t border-white/[0.08] font-sf">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-3 font-mono">
            Questions & Answers
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base sm:text-lg text-zinc-400 font-normal">
            Everything you need to know about using and installing Saral.
          </p>
        </div>

        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={faq.q} className="py-6">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-medium text-white group-hover:text-emerald-400 transition-colors tracking-tight">
                    {faq.q}
                  </span>
                  <span
                    className={`ml-4 shrink-0 transition-transform duration-200 text-zinc-500 group-hover:text-zinc-300 ${
                      isOpen ? "rotate-180 text-emerald-400" : ""
                    }`}
                  >
                    <ChevronDownIcon className="w-5 h-5" />
                  </span>
                </button>

                {isOpen && (
                  <p className="mt-3.5 text-sm sm:text-base text-zinc-400 leading-relaxed pr-8 font-normal">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
