"use client";

import { useState, useEffect, useCallback } from "react";

const SLIDES = [
  {
    id: 1,
    title: "Eerste Jaars Mastentocht 2024",
    bg: "#2a3a50",
    towerX: [100, 300, 500, 700, 900],
  },
  {
    id: 2,
    title: "BuCom 2025",
    bg: "#1e2d42",
    towerX: [150, 400, 650, 850],
  },
  {
    id: 3,
    title: "NICAT 2024",
    bg: "#243040",
    towerX: [80, 250, 500, 780, 1050],
  },
  {
    id: 4,
    title: "Steenhouwerij Workshop 2024",
    bg: "#1a2535",
    towerX: [200, 450, 700],
  },
  {
    id: 5,
    title: "Bedrijfsexcursie 2024",
    bg: "#222e40",
    towerX: [120, 380, 620, 900],
  },
  {
    id: 6,
    title: "Gala 2025",
    bg: "#1e273a",
    towerX: [60, 300, 600, 800, 1100],
  },
  {
    id: 7,
    title: "Sushi Workshop 2025",
    bg: "#28384e",
    towerX: [180, 420, 700, 950],
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent((idx + SLIDES.length) % SLIDES.length);
      setAnimating(false);
    }, 300);
  }, [animating]);

  useEffect(() => {
    const t = setInterval(() => go(current + 1), 5000);
    return () => clearInterval(t);
  }, [current, go]);

  const slide = SLIDES[current];

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{ background: slide.bg, aspectRatio: "2/1", maxHeight: 600 }}
    >
      {/* Tower silhouettes — slide background */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        style={{ opacity: animating ? 0 : 0.18, transition: "opacity 0.3s" }}
      >
        {slide.towerX.map((cx, i) => (
          <Tower key={i} cx={cx} scale={0.7 + (i % 3) * 0.15} />
        ))}
      </svg>

      {/* Prev arrow */}
      <button
        onClick={() => go(current - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20"
        style={{ lineHeight: 0 }}
        aria-label="Vorige dia"
      >
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M11.433 15.992L22.69 5.712c.393-.39.393-1.03 0-1.42-.393-.39-1.03-.39-1.423 0l-11.98 10.94c-.21.21-.3.49-.285.76-.015.28.075.56.284.77l11.98 10.94c.393.39 1.03.39 1.424 0 .393-.4.393-1.03 0-1.42l-11.257-10.29"
            fill="#ffffff"
            opacity="0.8"
            fillRule="evenodd"
          />
        </svg>
      </button>

      {/* Next arrow */}
      <button
        onClick={() => go(current + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
        style={{ lineHeight: 0 }}
        aria-label="Volgende dia"
      >
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.722 4.293c-.394-.39-1.032-.39-1.427 0-.393.39-.393 1.03 0 1.42l11.283 10.28-11.283 10.29c-.393.39-.393 1.02 0 1.42.395.39 1.033.39 1.427 0l12.007-10.94c.21-.21.3-.49.284-.77.014-.27-.076-.55-.286-.76L10.72 4.293z"
            fill="#ffffff"
            opacity="0.8"
            fillRule="evenodd"
          />
        </svg>
      </button>

      {/* Caption — bottom dark overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 flex justify-center pb-8"
        style={{ opacity: animating ? 0 : 1, transition: "opacity 0.3s" }}
      >
        <span
          className="text-white text-[1.4em] font-normal text-center px-4 py-1.5"
          style={{ background: "rgba(0,0,0,0.8)" }}
        >
          {slide.title}
        </span>
      </div>

      {/* Dot bullets */}
      <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center gap-1">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="w-[14px] h-[14px] rounded-full transition-colors"
            style={{
              background:
                i === current
                  ? "rgba(0,0,0,0.67)"
                  : "rgba(0,0,0,0.4)",
              border: i === current ? "2px solid #09b474" : "2px solid rgba(0,0,0,0.3)",
              padding: "3px",
              margin: "4px",
            }}
            aria-label={`Dia ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function Tower({ cx, scale = 1 }: { cx: number; scale?: number }) {
  const h = 500 * scale;
  return (
    <g
      transform={`translate(${cx}, 600) scale(${scale})`}
      stroke="white"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <line x1="0" y1={-h} x2={-20} y2={-h * 0.82} />
      <line x1="0" y1={-h} x2={20} y2={-h * 0.82} />
      <line x1={-55} y1={-h * 0.84} x2={55} y2={-h * 0.84} />
      <line x1={-20} y1={-h * 0.82} x2={-16} y2={-h * 0.55} />
      <line x1={20} y1={-h * 0.82} x2={16} y2={-h * 0.55} />
      <line x1={-20} y1={-h * 0.76} x2={20} y2={-h * 0.6} strokeWidth="1.5" />
      <line x1={20} y1={-h * 0.76} x2={-20} y2={-h * 0.6} strokeWidth="1.5" />
      <line x1={-48} y1={-h * 0.57} x2={48} y2={-h * 0.57} />
      <line x1={-16} y1={-h * 0.55} x2={-24} y2={-h * 0.15} />
      <line x1={16} y1={-h * 0.55} x2={24} y2={-h * 0.15} />
      <line x1={-16} y1={-h * 0.48} x2={22} y2={-h * 0.22} strokeWidth="1.5" />
      <line x1={16} y1={-h * 0.48} x2={-22} y2={-h * 0.22} strokeWidth="1.5" />
      <line x1={-16} y1={-h * 0.28} x2={22} y2={-h * 0.14} strokeWidth="1.5" />
      <line x1={16} y1={-h * 0.28} x2={-22} y2={-h * 0.14} strokeWidth="1.5" />
      <line x1={-40} y1={-h * 0.15} x2={40} y2={-h * 0.15} />
      <line x1={-24} y1={-h * 0.15} x2={-30} y2={0} />
      <line x1={24} y1={-h * 0.15} x2={30} y2={0} />
      <line x1={-35} y1={0} x2={35} y2={0} />
    </g>
  );
}
