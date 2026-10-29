"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { CheckIcon, MicIcon } from "./Icons";

type Demo = {
  lang: string;
  text: string;
  field: string;
  value: string;
  devanagari?: boolean;
};

// Same sample sentences as the feature grid, so the story stays consistent.
const DEMOS: Demo[] = [
  {
    lang: "Hindi · हिन्दी",
    text: "“मेरा जन्म पंद्रह अगस्त उन्नीस सौ अड़सठ को लखनऊ में हुआ था।”",
    field: "Date of birth",
    value: "15/08/1968",
    devanagari: true,
  },
  {
    lang: "Hinglish",
    text: "“Mera mobile number 9876543210 hai, note kar lo.”",
    field: "Mobile number",
    value: "9876543210",
  },
  {
    lang: "English",
    text: "“Full name Ramesh Kumar Sharma, applying for senior pension scheme.”",
    field: "Full name",
    value: "Ramesh Kumar Sharma",
  },
];

/** Split by grapheme so Devanagari conjuncts are never cut in half while "typing". */
type SegmenterCtor = new (
  locale?: string,
  options?: { granularity: "grapheme" },
) => { segment(input: string): Iterable<{ segment: string }> };

function graphemes(text: string): string[] {
  const Segmenter = (Intl as unknown as { Segmenter?: SegmenterCtor }).Segmenter;
  if (Segmenter) {
    return Array.from(new Segmenter(undefined, { granularity: "grapheme" }).segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

const PARTS = DEMOS.map((demo) => graphemes(demo.text));
const BARS = 16;

export function HeroVoiceDemo() {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const total = PARTS[index].length;

    if (reduced) {
      setShown(total);
      setDone(true);
      return;
    }

    setShown(0);
    setDone(false);

    let count = 0;
    let hold: number | undefined;
    const typing = window.setInterval(() => {
      count += 1;
      setShown(count);
      if (count >= total) {
        window.clearInterval(typing);
        setDone(true);
        hold = window.setTimeout(() => setIndex((value) => (value + 1) % DEMOS.length), 3200);
      }
    }, 42);

    return () => {
      window.clearInterval(typing);
      if (hold) window.clearTimeout(hold);
    };
  }, [index, reduced]);

  const demo = DEMOS[index];
  const typed = PARTS[index].slice(0, shown).join("");

  return (
    <div
      role="img"
      aria-label="Animated demo: a spoken sentence becomes a filled form field"
      className="relative mx-auto w-full max-w-2xl"
    >
      <div aria-hidden="true" className="absolute -inset-x-6 -inset-y-4 -z-10 rounded-[40px] bg-emerald-500/10 blur-2xl" />

      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-[28px] bg-white/4.5 p-3 text-left shadow-[0_30px_80px_-24px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/10 backdrop-blur-xl sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:p-3.5">
        {/* Mic orb: ripples while "listening", settles once the sentence lands */}
        <div className="relative grid h-12 w-12 place-items-center">
          {!done && <span aria-hidden="true" className="hero-ripple absolute inset-0 rounded-full bg-emerald-400/30" />}
          <span className="relative grid h-12 w-12 place-items-center rounded-full bg-linear-to-b from-emerald-300 to-emerald-500 text-emerald-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_8px_24px_-8px_rgba(16,185,129,0.9)]">
            <MicIcon className="h-5 w-5" />
          </span>
        </div>

        {/* Transcript */}
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2.5 text-[11px] font-medium text-zinc-400">
            <span>{demo.lang}</span>
            <span aria-hidden="true" data-idle={done} className="hero-bars flex h-4 items-center gap-0.5 text-emerald-400">
              {Array.from({ length: BARS }, (_, i) => {
                const style = {
                  "--d": `${0.7 + ((i * 7) % 5) * 0.12}s`,
                  "--dl": `${-((i * 97) % 600)}ms`,
                } as CSSProperties;
                return <span key={i} className="hero-bar" style={style} />;
              })}
            </span>
          </div>

          {/* The invisible full sentence reserves the final height: no layout shift while typing. */}
          <p className={`relative text-[15px] leading-snug text-zinc-100 sm:text-base ${demo.devanagari ? "devanagari" : ""}`}>
            <span aria-hidden="true" className="invisible">
              {demo.text}
            </span>
            <span className="absolute inset-0">
              {typed}
              {!done && <span className="hero-caret" />}
            </span>
          </p>
        </div>

        {/* Result */}
        <div
          className={`col-span-2 flex items-center justify-between gap-4 rounded-2xl bg-black/40 px-3.5 py-2.5 ring-1 ring-inset transition-all duration-500 sm:col-span-1 sm:min-w-48 ${
            done ? "translate-y-0 opacity-100 ring-emerald-400/30" : "translate-y-1 opacity-40 ring-white/10"
          }`}
        >
          <div className="min-w-0">
            <p className="text-[11px] text-zinc-500">{demo.field}</p>
            <p className="truncate font-mono text-[14px] font-medium text-white">{done ? demo.value : "—"}</p>
          </div>
          <span
            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
              done ? "bg-emerald-400 text-emerald-950" : "bg-white/10 text-transparent"
            }`}
          >
            <CheckIcon className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
}