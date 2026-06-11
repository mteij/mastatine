"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/towers", label: "Masts" },
  { href: "/submit", label: "Submit a Mast" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-[#1a2332] text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl">📡</span>
            <div>
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-yellow-400 transition-colors">
                S.A. Mastatine
              </span>
              <span className="block text-xs text-slate-400 leading-none">
                Study Association for Advanced Tower Technology
              </span>
            </div>
          </Link>

          <nav>
            <ul className="flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      pathname === href
                        ? "bg-yellow-400 text-[#1a2332]"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
