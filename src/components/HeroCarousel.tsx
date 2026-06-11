"use client";

import { useState, useEffect, useCallback } from "react";

const slides = [
  {
    title: "Welcome to S.A. Mastatine",
    body: "The study association for Advanced Tower Technology students, mast enthusiasts, and everyone who has ever looked up at a transmission tower and felt something.",
    cta: "Have a look around!",
    href: "#towers",
    towerColor: "#2a3a50",
  },
  {
    title: "Submit Your Finest Mast",
    body: "Found a spectacular transmission tower, antenna mast, or communication pylon? Add it to the Mastatine registry and let the community vote.",
    cta: "Submit a Mast",
    href: "#submit",
    towerColor: "#1e2e40",
  },
  {
    title: "Vote for the Best Tower",
    body: "Browse submissions from mast enthusiasts across the Netherlands and beyond. Upvote your favourites and help us rank the world's finest electromagnetic structures.",
    cta: "Browse Masts",
    href: "#towers",
    towerColor: "#243444",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const go = useCallback(
    (idx: number) => {
      setFading(true);
      setTimeout(() => {
        setCurrent((idx + slides.length) % slides.length);
        setFading(false);
      }, 250);
    },
    []
  );

  useEffect(() => {
    const t = setTimeout(() => go(current + 1), 6000);
    return () => clearTimeout(t);
  }, [current, go]);

  const slide = slides[current];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ background: "#1a2332", minHeight: 420 }}
    >
      {/* Background tower silhouettes */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
        <svg viewBox="0 0 1200 420" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          {[80, 250, 450, 650, 850, 1050, 1150].map((cx, i) => (
            <SilhouetteTower key={i} cx={cx} scale={0.8 + (i % 3) * 0.15} />
          ))}
        </svg>
      </div>

      {/* Slide content */}
      <div
        className="relative z-10 max-w-5xl mx-auto px-8 py-16 flex flex-col items-start justify-center text-white"
        style={{
          minHeight: 420,
          transition: "opacity 0.25s",
          opacity: fading ? 0 : 1,
        }}
      >
        <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#f57f20" }}>
          S.A. Mastatine
        </p>
        <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4 max-w-2xl">
          {slide.title}
        </h1>
        <p className="text-slate-300 text-base mb-8 max-w-xl leading-relaxed">
          {slide.body}
        </p>
        <a href={slide.href} className="btn-orange text-sm">
          {slide.cta}
        </a>
      </div>

      {/* Left / right arrows */}
      <button
        onClick={() => go(current - 1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        onClick={() => go(current + 1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
        aria-label="Next slide"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="w-2.5 h-2.5 rounded-full transition-colors"
            style={{ background: i === current ? "#f57f20" : "rgba(255,255,255,0.4)" }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function SilhouetteTower({ cx, scale = 1 }: { cx: number; scale?: number }) {
  const h = 380 * scale;
  const base = 420;
  return (
    <g
      transform={`translate(${cx}, ${base}) scale(${scale})`}
      stroke="white"
      fill="none"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="0" y1={-h} x2={-18} y2={-h * 0.82} />
      <line x1="0" y1={-h} x2={18} y2={-h * 0.82} />
      <line x1={-50} y1={-h * 0.84} x2={50} y2={-h * 0.84} />
      <line x1={-18} y1={-h * 0.82} x2={-14} y2={-h * 0.55} />
      <line x1={18} y1={-h * 0.82} x2={14} y2={-h * 0.55} />
      <line x1={-18} y1={-h * 0.76} x2={18} y2={-h * 0.6} strokeWidth="1.5" />
      <line x1={18} y1={-h * 0.76} x2={-18} y2={-h * 0.6} strokeWidth="1.5" />
      <line x1={-46} y1={-h * 0.57} x2={46} y2={-h * 0.57} />
      <line x1={-14} y1={-h * 0.55} x2={-22} y2={-h * 0.15} />
      <line x1={14} y1={-h * 0.55} x2={22} y2={-h * 0.15} />
      <line x1={-14} y1={-h * 0.48} x2={20} y2={-h * 0.22} strokeWidth="1.5" />
      <line x1={14} y1={-h * 0.48} x2={-20} y2={-h * 0.22} strokeWidth="1.5" />
      <line x1={-14} y1={-h * 0.28} x2={20} y2={-h * 0.14} strokeWidth="1.5" />
      <line x1={14} y1={-h * 0.28} x2={-20} y2={-h * 0.14} strokeWidth="1.5" />
      <line x1={-38} y1={-h * 0.15} x2={38} y2={-h * 0.15} />
      <line x1={-22} y1={-h * 0.15} x2={-28} y2={0} />
      <line x1={22} y1={-h * 0.15} x2={28} y2={0} />
      <line x1={-32} y1={0} x2={32} y2={0} />
    </g>
  );
}
