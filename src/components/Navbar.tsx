"use client";

import Link from "next/link";
import { useState } from "react";
import MastatineLogo from "./MastatineLogo";

const navLinks = [
  { href: "#home",   label: "Home" },
  { href: "#towers", label: "Masts" },
  { href: "#submit", label: "Submit a Mast" },
  { href: "#about",  label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-[#e0e0e0] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <MastatineLogo size={46} />
          <div className="hidden sm:block leading-tight">
            <span className="font-black text-[#2d2d2d] text-base group-hover:text-[#f57f20] transition-colors">
              S.A. Mastatine
            </span>
            <span className="block text-[10px] text-[#888] tracking-wide uppercase">
              Study Assoc. for Advanced Tower Technology
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:block">
          <ul className="flex items-center">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="px-4 py-5 block text-sm font-semibold text-[#555] hover:text-[#f57f20] border-b-2 border-transparent hover:border-[#f57f20] transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
            <li className="ml-3">
              <a
                href="#submit"
                className="btn-orange text-sm px-4 py-2"
              >
                + Submit
              </a>
            </li>
          </ul>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-[#555] hover:text-[#f57f20]"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {open ? (
              <>
                <line x1="4" y1="4" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="18" y1="4" x2="4" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-[#e0e0e0] bg-white">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-semibold text-[#555] hover:text-[#f57f20] hover:bg-[#f7f7f7] border-b border-[#f0f0f0]"
            >
              {label}
            </a>
          ))}
          <div className="p-4">
            <a href="#submit" className="btn-orange text-sm w-full text-center block" onClick={() => setOpen(false)}>
              + Submit a Mast
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
