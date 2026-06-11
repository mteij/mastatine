"use client";

import Link from "next/link";
import MastatineLogo from "./MastatineLogo";

const navLinks = [
  { href: "#towers", label: "Masts" },
  { href: "#submit", label: "Submit a Mast" },
  { href: "#about", label: "About" },
];

export default function Navbar() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <MastatineLogo size={44} />
            <div className="hidden sm:block">
              <span className="font-black text-[#1b2539] text-base tracking-tight group-hover:text-[#e8b800] transition-colors">
                S.A. Mastatine
              </span>
              <span className="block text-[10px] text-slate-400 leading-none tracking-wide uppercase">
                Study Assoc. for Advanced Tower Technology
              </span>
            </div>
          </Link>

          <nav>
            <ul className="flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="px-4 py-2 rounded text-sm font-semibold text-slate-600 hover:text-[#1b2539] hover:bg-slate-100 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#submit"
                  className="ml-2 px-4 py-2 rounded-lg text-sm font-bold bg-[#1b2539] text-white hover:bg-[#e8b800] hover:text-[#1b2539] transition-colors"
                >
                  + Submit
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
