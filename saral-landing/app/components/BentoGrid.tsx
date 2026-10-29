"use client";

import React, { useState } from "react";
import {
  GlobeIcon,
  SparklesIcon,
  SpeakerIcon,
  ShieldIcon,
  FileTextIcon,
  ZapIcon,
} from "./Icons";

export function BentoGrid() {
  const [activeLang, setActiveLang] = useState<"hi" | "hinglish" | "en">("hi");

  return (
    <section id="features" className="py-24 sm:py-32 bg-black border-t border-white/8 font-sf">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-400 text-xs font-semibold border border-emerald-500/20 mb-4">
            <ZapIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Modern Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white leading-tight">
            Designed for real people, <br />
            <span className="text-zinc-500 font-normal">not just tech-savvy users.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 font-normal leading-relaxed">
            Filling out Indian government and administrative forms shouldn&apos;t require a computer science degree. Here is how Saral solves it under the hood.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 2-column wide - Code Switching Speech */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-zinc-950/80 border border-white/8 shadow-xs flex flex-col justify-between hover:border-white/[0.16] transition-all">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950/70 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <GlobeIcon className="w-5 h-5" />
                </div>
                <div className="flex gap-1.5 p-1 bg-zinc-900 border border-white/6 rounded-xl text-xs font-medium">
                  <button
                    onClick={() => setActiveLang("hi")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeLang === "hi"
                        ? "bg-white text-black shadow-2xs font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Hindi (हिन्दी)
                  </button>
                  <button
                    onClick={() => setActiveLang("hinglish")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeLang === "hinglish"
                        ? "bg-white text-black shadow-2xs font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Hinglish
                  </button>
                  <button
                    onClick={() => setActiveLang("en")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeLang === "en"
                        ? "bg-white text-black shadow-2xs font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mb-2">
                Automatic Code-Switching Speech Engine
              </h3>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal mb-6 max-w-xl">
                Indians speak fluidly across languages. Saral uses Groq Whisper Large V3 with automatic language detection, parsing rapid transitions between Hindi and English with high phonetic accuracy.
              </p>

              {/* Sample Voice Demonstration Box */}
              <div className="p-4 rounded-2xl bg-black/80 border border-white/8">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Real-time voice stream</span>
                </div>
                <p className="text-sm font-medium text-zinc-200 devanagari">
                  {activeLang === "hi" &&
                    "“मेरा जन्म पंद्रह अगस्त उन्नीस सौ अड़सठ को लखनऊ में हुआ था।”"}
                  {activeLang === "hinglish" &&
                    "“DOB 15th August 1968 hai aur mobile number 9876543210 note kar lo.”"}
                  {activeLang === "en" &&
                    "“Full name Ramesh Kumar Sharma, applying for senior pension scheme.”"}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/6 flex items-center justify-between text-xs text-zinc-400">
              <span>Groq Whisper V3 API</span>
              <span className="font-mono text-emerald-400 font-medium">Avg latency: 238ms</span>
            </div>
          </div>

          {/* Card 2: 1-column - Smart Normalizer */}
          <div className="p-8 rounded-3xl bg-zinc-950/80 border border-white/8 shadow-xs flex flex-col justify-between hover:border-white/[0.16] transition-all">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-950/70 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/20">
                <SparklesIcon className="w-5 h-5" />
              </div>

              <h3 className="text-xl font-semibold tracking-tight text-white mb-2">
                Smart Normalization
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-normal mb-6">
                Transforms conversational speech into strict database inputs automatically.
              </p>

              {/* Interactive normalization rows */}
              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-black/80 border border-white/8 flex items-center justify-between">
                  <span className="text-zinc-500 text-[11px] truncate max-w-32.5">
                    &quot;15 August 1968&quot;
                  </span>
                  <span className="text-emerald-400 font-semibold bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded">
                    15/08/1968
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/80 border border-white/8 flex items-center justify-between">
                  <span className="text-zinc-500 text-[11px] truncate max-w-
                  [130px]">
                    &quot;2.5 lakh rupees&quot;
                  </span>
                  <span className="text-emerald-400 font-semibold bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded">
                    ₹2,50,000
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/80 border border-white/8 flex items-center justify-between">
                  <span className="text-zinc-500 text-[11px] truncate max-w-32.5">
                    &quot;john dot doe at mail&quot;
                  </span>
                  <span className="text-emerald-400 font-semibold bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded">
                    john.doe@mail.com
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/6 text-xs text-zinc-500">
              Zero manual formatting needed
            </div>
          </div>

          {/* Card 3: 1-column - Spoken Audio Explainer */}
          <div className="p-8 rounded-3xl bg-zinc-950/80 border border-white/8 shadow-xs flex flex-col justify-between hover:border-white/[0.16] transition-all">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-950/70 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/20">
                <SpeakerIcon className="w-5 h-5" />
              </div>

              <h3 className="text-xl font-semibold tracking-tight text-white mb-2">
                Spoken Form Explanations
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-normal mb-6">
                Government portals use complex bureaucratic terms. Saral reads out plain-language explanations in Hindi so elders understand what is needed.
              </p>

              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed devanagari">
                &ldquo;इस फॉर्म में आपको अपना आधार नंबर और बैंक खाता दर्ज करना है, ताकि पेंशन सीधे आपके खाते में आए।&rdquo;
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/6 text-xs text-zinc-500">
              Respectful, simple audio prompts
            </div>
          </div>

          {/* Card 4: 2-column - The Golden Rule: Never Auto-Submit */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-zinc-950/80 border border-white/8 shadow-xs flex flex-col justify-between hover:border-white/[0.16] transition-all">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950/70 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <ShieldIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/70 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Core Security Protocol
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mb-2">
                The Golden Rule: Never Auto-Submit
              </h3>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal mb-6 max-w-xl">
                Autonomous AI submitting legal citizen forms is dangerous. Saral strictly acts as an assistive filler: it inputs the data into the page, flags missing items, and leaves the final review and &ldquo;Submit&rdquo; click to you.
              </p>

              {/* Visual Workflow Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-black/80 border border-white/8">
                  <span className="font-semibold text-white block mb-1">1. Voice Scan</span>
                  <span className="text-zinc-400">Saral maps fields to values accurately.</span>
                </div>
                <div className="p-3 rounded-xl bg-black/80 border border-white/8">
                  <span className="font-semibold text-white block mb-1">2. Visual Injection</span>
                  <span className="text-zinc-400">Fields on page glow green with values.</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                  <span className="font-semibold text-emerald-300 block mb-1">3. You Press Submit</span>
                  <span className="text-emerald-400">100% human-verified final step.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/6 flex items-center justify-between text-xs text-zinc-500">
              <span>Safety architecture</span>
              <span className="text-emerald-400 font-medium">Zero accidental submissions</span>
            </div>
          </div>

          {/* Card 5: Full Width / 3-column - Universal DOM Scanner */}
          <div className="md:col-span-3 p-8 rounded-3xl bg-zinc-950 border border-white/10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-zinc-300 text-xs font-semibold border border-white/[0.1] mb-4">
                <FileTextIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Site Integration Required</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
                Works on virtually any website in India & beyond
              </h3>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
                Government NIC portals, state scholarship sites, university admissions, banking KYC, job boards, or Google Forms. Saral scans standard HTML inputs, selects, radios, and textareas on the fly.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
              <span className="px-3.5 py-1.5 rounded-full bg-zinc-900 border border-white/8 text-xs font-mono text-zinc-300">
                Government Portals
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-zinc-900 border border-white/8 text-xs font-mono text-zinc-300">
                Banking & KYC
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-zinc-900 border border-white/8 text-xs font-mono text-zinc-300">
                Scholarships
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-zinc-900 border border-white/8 text-xs font-mono text-zinc-300">
                Google Forms
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
