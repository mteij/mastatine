"use client";

import { useState, useEffect, useCallback } from "react";
import type { MastSlide } from "@/app/page";

const PLACEHOLDER_BG = ["#2a3a50", "#1e2d42", "#243040"];
const PLACEHOLDER_TOWERS: number[][] = [
  [100, 300, 500, 700, 900],
  [150, 400, 650, 850],
  [80, 250, 500, 780, 1050],
];

export default function HeroCarousel({ masts }: { masts: MastSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const count = masts.length > 0 ? masts.length : PLACEHOLDER_TOWERS.length;

  const go = useCallback(
    (idx: number) => {
      if (animating) return;
      setAnimating(true);
      setTimeout(() => {
        setCurrent(((idx % count) + count) % count);
        setAnimating(false);
      }, 300);
    },
    [animating, count]
  );

  useEffect(() => {
    const t = setInterval(() => go(current + 1), 5000);
    return () => clearInterval(t);
  }, [current, go]);

  const fade = { opacity: animating ? 0 : 1, transition: "opacity 0.3s" };

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{
        background:
          masts.length > 0 ? "#111a25" : (PLACEHOLDER_BG[current] ?? "#1a2535"),
        aspectRatio: "2/1",
        maxHeight: 600,
      }}
    >
      {masts.length > 0 ? (
        <>
          {/* Real mast photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={masts[current].id}
            src={masts[current].image_url}
            alt={masts[current].title}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              ...fade,
            }}
          />
          {/* gradient overlay for legibility */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 55%)",
            }}
          />
          {/* "Mast of the Month" badge */}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              background: "#f57f20",
              color: "#fff",
              fontFamily: "Lato, Arial, sans-serif",
              fontWeight: 700,
              fontSize: "0.78em",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              padding: "0.3em 0.8em",
              zIndex: 10,
            }}
          >
            Mast of the Month
          </div>
        </>
      ) : (
        /* Placeholder SVG silhouettes */
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
          style={{ opacity: animating ? 0 : 0.18, transition: "opacity 0.3s" }}
        >
          {(PLACEHOLDER_TOWERS[current] ?? []).map((cx, i) => (
            <TowerSvg key={i} cx={cx} scale={0.7 + (i % 3) * 0.15} />
          ))}
        </svg>
      )}

      {/* Prev arrow */}
      {count > 1 && (
        <button
          onClick={() => go(current - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20"
          style={{ lineHeight: 0 }}
          aria-label="Previous slide"
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
      )}

      {/* Next arrow */}
      {count > 1 && (
        <button
          onClick={() => go(current + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20"
          style={{ lineHeight: 0 }}
          aria-label="Next slide"
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
      )}

      {/* Caption */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pb-8 flex flex-col items-center gap-1"
        style={fade}
      >
        {masts.length > 0 ? (
          <>
            <span
              className="text-white font-bold text-center px-4"
              style={{ fontSize: "1.4em", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
            >
              {masts[current].title}
            </span>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9em" }}>
              Submitted by {masts[current].submitter_name}
              {" · "}
              {masts[current].monthly_votes > 0
                ? `${masts[current].monthly_votes} vote${masts[current].monthly_votes !== 1 ? "s" : ""} this month`
                : `${masts[current].vote_count} vote${masts[current].vote_count !== 1 ? "s" : ""} total`}
            </span>
          </>
        ) : (
          <span
            className="text-white text-[1.1em] font-normal text-center px-4 py-1.5"
            style={{ background: "rgba(0,0,0,0.8)" }}
          >
            No masts submitted yet — be the first!
          </span>
        )}
      </div>

      {/* Dot bullets */}
      {count > 1 && (
        <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center gap-1">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className="rounded-full transition-colors"
              style={{
                width: 14,
                height: 14,
                background: i === current ? "rgba(0,0,0,0.67)" : "rgba(0,0,0,0.4)",
                border: i === current ? "2px solid #09b474" : "2px solid rgba(0,0,0,0.3)",
                padding: 3,
                margin: 4,
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TowerSvg({ cx, scale = 1 }: { cx: number; scale?: number }) {
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
