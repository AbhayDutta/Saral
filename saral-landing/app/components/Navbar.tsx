"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Navbar as ResizableNavbar,
  NavBody,
  NavItems,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from "@/components/ui/resizable-navbar";

const navItems = [
  { name: "How it works", link: "#how-it-works" },
  { name: "Features", link: "#features" },
  { name: "Simulator", link: "#demo" },
  { name: "Privacy", link: "#privacy" },
  { name: "FAQ", link: "#faq" },
];

function Logo() {
  return (
    <a href="#" className="relative z-20 mr-4 flex items-center gap-2.5 px-2 py-1">
      <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-emerald-500 ring-1 ring-emerald-400/30">
        <Image
          src="/icon/icon128.png"
          alt="Saral logo"
          width={28}
          height={28}
          className="h-7 w-7 object-cover"
        />
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="text-base font-semibold tracking-[-0.02em] text-white">
          Saral
        </span>
        <span className="devanagari text-[11px] font-normal text-zinc-500">
          सरल
        </span>
      </span>
    </a>
  );
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ResizableNavbar className="px-4 pt-3 sm:px-6">
      {/* Desktop Navigation */}
      <NavBody>
        <Logo />
        <NavItems items={navItems} />
        <div className="relative z-20 flex items-center gap-3">
          <NavbarButton
            href="#install"
            variant="primary"
            className="rounded-full px-5 py-2.5 text-[13px] font-semibold shadow-[0_0_24px_rgba(52,211,153,0.25)]"
          >
            Get Extension
          </NavbarButton>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <Logo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          className="border border-white/10 bg-neutral-950/95 backdrop-blur-xl"
        >
          {navItems.map((item, idx) => (
            <a
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative w-full text-[15px] text-neutral-300 transition-colors hover:text-white"
            >
              <span className="block">{item.name}</span>
            </a>
          ))}
          <div className="flex w-full flex-col gap-3">
            <NavbarButton
              href="#install"
              variant="primary"
              className="w-full rounded-full py-2.5 text-sm font-semibold"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get Extension
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
  );
}
