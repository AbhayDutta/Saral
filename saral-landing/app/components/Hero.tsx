import React from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { ArrowRightIcon, EdgeIcon, LockIcon, ZapIcon } from "./Icons";
import { HeroVoiceDemo } from "./HeoVoiceDemo";

/** Entrance order: each element rises 110ms after the previous one. */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-black pb-20 pt-28 font-sf sm:pb-28 sm:pt-36">
      {/* Backdrop: one image (the old version loaded it twice), an emerald light from above, grain. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src="/herobg.jpeg"
          alt=""
          fill
          priority
          unoptimized
          className="object-cover object-top opacity-60 sm:object-center"
        />
        <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_0%,rgba(16,185,129,0.22),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black to-transparent" />
        <div className="hero-grain absolute inset-0" />
      </div>

      <div className="mx-auto max-w-6xl px-6 text-center sm:px-8">
        {/* Announcement */}
        <a
          href="#features"
          style={step(0)}
          className="hero-rise hero-pill group mb-9 inline-flex items-center gap-2.5 rounded-full bg-white/[0.04] py-1.5 pl-1.5 pr-3.5 text-[13px] text-zinc-300 backdrop-blur-md transition-colors hover:bg-white/[0.07]"
        >
          <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
            Saral 1.0
          </span>
          Voice-first form assistant for everyone
          <ArrowRightIcon className="h-3 w-3 text-zinc-500 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-300" />
        </a>

        {/* Headline: crisp white, no underline or grey second line. */}
        <h1
          style={step(1)}
          className="hero-rise mx-auto max-w-4xl text-balance text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-7xl lg:text-[5.5rem]"
        >
          Stop fighting web forms.
          <span className="mt-1 block text-white">Just speak.</span>
        </h1>

        <p
          style={step(2)}
          className="hero-rise mx-auto mt-6 max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base"
        >
          A lightweight extension that fills forms by voice in Hindi, English or Hinglish — and never submits for you.
        </p>

        {/* CTA */}
        <div style={step(3)} className="hero-rise mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#install"
            className="group inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-white px-7 text-[15px] font-semibold text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_0_0_1px_rgba(255,255,255,0.2),0_12px_40px_-12px_rgba(52,211,153,0.55)] transition-all hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_0_0_1px_rgba(255,255,255,0.3),0_16px_56px_-10px_rgba(52,211,153,0.8)] active:scale-[0.98] sm:w-auto"
          >
            <EdgeIcon className="h-4 w-4" />
            <span>Add to Edge — it&apos;s free</span>
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#how-it-works"
            className="inline-flex h-12 items-center rounded-full px-5 text-[15px] font-medium text-zinc-300 transition-colors hover:text-white"
          >
            See how it works
          </a>
        </div>

        {/* Proof, as quiet text instead of three identical pills */}
        <ul
          style={step(4)}
          className="hero-rise mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-zinc-400"
        >
          <li className="flex items-center gap-2">
            <ZapIcon className="h-3.5 w-3.5 text-emerald-400" />
            &lt;250 ms Whisper latency
          </li>
          <li aria-hidden="true" className="hidden h-3 w-px bg-white/15 sm:block" />
          <li className="flex items-center gap-2">
            <LockIcon className="h-3.5 w-3.5 text-emerald-400" />
            Keys stay in your browser
          </li>
          <li aria-hidden="true" className="hidden h-3 w-px bg-white/15 sm:block" />
          <li>Hindi · Hinglish · English</li>
        </ul>

        {/* Product: speech becomes a field, then the page */}
        <div style={step(5)} className="hero-rise mx-auto mt-16 max-w-5xl">
          <HeroVoiceDemo />

          <div className="flex justify-center py-1" aria-hidden="true">
            <div className="hero-signal" />
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-x-10 -top-6 bottom-24 -z-10 rounded-[48px] bg-emerald-500/20 blur-3xl"
            />
            {/* The bottom of the mockup melts into the next section. */}
            <div className="[mask-image:linear-gradient(to_bottom,black_75%,transparent)]">
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}