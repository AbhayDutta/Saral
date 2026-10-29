import React from "react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/[0.08] py-16 sm:py-20 text-zinc-500 font-sf">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-14">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center bg-emerald-500 shadow-sm ring-1 ring-emerald-400/30">
                <Image
                  src="/icon/icon128.png"
                  alt="Saral logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-cover"
                />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-semibold text-lg text-white tracking-[-0.02em]">
                  Saral
                </span>
                <span className="text-xs text-zinc-500 devanagari">सरल</span>
              </div>
            </div>

            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed mb-4 font-normal">
              Empowering people with limited digital literacy to fill complex online forms by speaking instead of typing.
            </p>

            <p className="text-xs text-zinc-600 devanagari">
              डिजिटल साक्षरता की दूरी मिटाने का एक विनम्र प्रयास।
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-4 font-mono">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-white transition-colors"
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="hover:text-white transition-colors"
                >
                  Architecture & Bento
                </a>
              </li>
              <li>
                <a
                  href="#demo"
                  className="hover:text-white transition-colors"
                >
                  Live Simulator
                </a>
              </li>
              <li>
                <a
                  href="#privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Manifesto
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <div>
            &copy; 2026 Saral Contributors. Free and open source software.
          </div>
          <div className="flex items-center gap-6">
            <span>Built with respect for accessibility</span>
            <span>•</span>
            <span>Zero telemetry</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
