"use client";

import React, { useState } from "react";
import { CheckIcon, ShieldIcon, SparklesIcon } from "./Icons";

interface Scenario {
  id: string;
  title: string;
  category: string;
  language: string;
  spokenAudio: string;
  spokenTranslation?: string;
  fields: {
    label: string;
    labelHindi: string;
    value: string;
    normalizedNote?: string;
  }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "pension",
    title: "Old Age Pension Form",
    category: "Government Services",
    language: "Hindi (हिन्दी)",
    spokenAudio:
      "“मेरा नाम रमेश कुमार शर्मा है। जन्म 15 अगस्त 1968 को हुआ था। मोबाइल नंबर 98765 43210 और मेरा बैंक खाता स्टेट बैंक ऑफ इंडिया में है।”",
    spokenTranslation:
      "My name is Ramesh Kumar Sharma. Born 15 August 1968. Mobile 98765 43210 and my bank account is in State Bank of India.",
    fields: [
      {
        label: "Applicant Full Name",
        labelHindi: "आवेदक का पूरा नाम",
        value: "Ramesh Kumar Sharma",
        normalizedNote: "Transliterated & Title Cased",
      },
      {
        label: "Date of Birth",
        labelHindi: "जन्म तिथि",
        value: "15/08/1968",
        normalizedNote: "Auto-formatted from spoken date",
      },
      {
        label: "Mobile Number",
        labelHindi: "मोबाइल नंबर",
        value: "+91 98765 43210",
        normalizedNote: "Validated 10-digit format",
      },
      {
        label: "Bank Name",
        labelHindi: "बैंक का नाम",
        value: "State Bank of India (SBI)",
        normalizedNote: "Matched to IFSC directory",
      },
    ],
  },
  {
    id: "scholarship",
    title: "Post-Matric Scholarship",
    category: "Education & Student Aid",
    language: "Hinglish",
    spokenAudio:
      "“Mera naam Priya Patel hai, roll number CS2489. Family annual income 2 lakh 40 thousand hai aur admission BTech Computer Science mein hua hai.”",
    spokenTranslation:
      "My name is Priya Patel, roll number CS2489. Annual income is ₹2,40,000 and admission is in BTech Computer Science.",
    fields: [
      {
        label: "Student Name",
        labelHindi: "छात्र का नाम",
        value: "Priya Patel",
        normalizedNote: "Spoken name mapped",
      },
      {
        label: "Roll Number / Enrollment",
        labelHindi: "अनुक्रमांक",
        value: "CS-2489",
        normalizedNote: "Code format preserved",
      },
      {
        label: "Annual Household Income",
        labelHindi: "पारिवारिक वार्षिक आय",
        value: "₹2,40,000",
        normalizedNote: "Converted words to currency figure",
      },
      {
        label: "Degree Course",
        labelHindi: "पाठ्यक्रम का नाम",
        value: "B.Tech (Computer Science & Engg)",
        normalizedNote: "Matched to dropdown option",
      },
    ],
  },
  {
    id: "job",
    title: "Employment Registration",
    category: "Career & Skill Portal",
    language: "English / Hinglish",
    spokenAudio:
      "“Ankit Verma here. Email ankit dot verma at outlook dot com. 3 years experience as solar technician, currently living in Lucknow 226010.”",
    spokenTranslation:
      "Spoken email normalized, pincode matched to district database.",
    fields: [
      {
        label: "Candidate Name",
        labelHindi: "उम्मीदवार का नाम",
        value: "Ankit Verma",
        normalizedNote: "Verified name",
      },
      {
        label: "Email Address",
        labelHindi: "ईमेल पता",
        value: "ankit.verma@outlook.com",
        normalizedNote: "Normalized from 'dot' & 'at'",
      },
      {
        label: "Total Work Experience",
        labelHindi: "कुल कार्यानुभव",
        value: "3 Years",
        normalizedNote: "Parsed duration",
      },
      {
        label: "City & PIN Code",
        labelHindi: "शहर एवं पिन कोड",
        value: "Lucknow, Uttar Pradesh — 226010",
        normalizedNote: "Postal code validated",
      },
    ],
  },
];

export function InteractiveDemo() {
  const [activeId, setActiveId] = useState("pension");
  const [isSimulating, setIsSimulating] = useState(false);
  const [filledCount, setFilledCount] = useState(4);

  const current = SCENARIOS.find((s) => s.id === activeId) ?? SCENARIOS[0];

  const handleSelect = (id: string) => {
    setActiveId(id);
    setIsSimulating(true);
    setFilledCount(0);
    setTimeout(() => setFilledCount(1), 150);
    setTimeout(() => setFilledCount(2), 300);
    setTimeout(() => setFilledCount(3), 450);
    setTimeout(() => {
      setFilledCount(4);
      setIsSimulating(false);
    }, 600);
  };

  return (
    <section id="demo" className="py-24 sm:py-32 bg-black font-sf">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-400 text-xs font-semibold border border-emerald-500/20 mb-4">
            <SparklesIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white leading-tight">
            See speech become structured data
          </h2>
          <p className="mt-3 text-base sm:text-lg text-zinc-400 font-normal leading-relaxed">
            Select a real-world scenario below to test how natural conversational speech transforms into validated form fields.
          </p>
        </div>

        {/* Scenario Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {SCENARIOS.map((item) => {
            const isSelected = item.id === activeId;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-white text-black shadow-xs font-semibold"
                    : "bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-white/[0.08]"
                }`}
              >
                <span>{item.title}</span>
                <span className="ml-2 text-[11px] opacity-70 font-normal">
                  ({item.language.split(" ")[0]})
                </span>
              </button>
            );
          })}
        </div>

        {/* Demo Card Surface */}
        <div className="rounded-3xl border border-white/[0.1] bg-zinc-950/90 p-5 sm:p-8 shadow-2xl">
          {/* Spoken Voice Banner */}
          <div className="bg-black/90 rounded-2xl p-5 border border-white/[0.08] shadow-xs mb-6">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  {isSimulating ? "Parsing speech in real-time..." : `Spoken in ${current.language}`}
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-0.5 rounded border border-white/[0.08]">
                Groq Whisper V3 • Latency 280ms
              </span>
            </div>

            <p className="text-base sm:text-lg text-white font-medium leading-relaxed font-sans">
              {current.spokenAudio}
            </p>

            {current.spokenTranslation && (
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 italic">
                Translation: &ldquo;{current.spokenTranslation}&rdquo;
              </p>
            )}
          </div>

          {/* Form Result Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {current.fields.map((field, idx) => {
              const isFilled = idx < filledCount;
              return (
                <div
                  key={field.label}
                  className={`relative p-4 rounded-2xl border transition-all duration-300 ${
                    isFilled
                      ? "border-emerald-500/40 bg-zinc-900/80"
                      : "border-white/[0.06] bg-zinc-900/30 opacity-40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="text-xs font-medium text-zinc-400 block">
                        {field.label}
                      </span>
                      <span className="text-[11px] text-zinc-500 block devanagari">
                        {field.labelHindi}
                      </span>
                    </div>
                    {isFilled && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                        <CheckIcon className="w-3 h-3 text-emerald-400" />
                        Matched
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-sm sm:text-base font-semibold text-white font-sans tracking-tight">
                    {isFilled ? field.value : "—"}
                  </div>

                  {field.normalizedNote && isFilled && (
                    <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                      <span>{field.normalizedNote}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Security / Control Guarantee */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <ShieldIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Safety guarantee:</strong> Saral fills form inputs on the webpage, but <em>never</em> presses Submit. You review the page and submit it yourself.
              </span>
            </div>
            <span className="font-mono text-[11px] text-zinc-500 shrink-0">
              Zero telemetry • 100% Client-Side
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
