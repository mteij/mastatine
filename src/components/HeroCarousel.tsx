"use client";

import { useState } from "react";
import Image from "next/image";
import type { MastSlide } from "@/lib/types";
import TowerDetailModal from "./TowerDetailModal";
import { submitVote, type VoteDirection } from "@/lib/vote";

export default function HeroCarousel({ masts }: { masts: MastSlide[] }) {
  const mast = masts[0] ?? null;
  const [showModal, setShowModal] = useState(false);
  const [voteDelta, setVoteDelta] = useState(0);
  const [voteDirection, setVoteDirection] = useState<VoteDirection | null>(null);

  const towerForModal = mast
    ? {
        id: mast.id,
        title: mast.title,
        image_url: mast.image_url,
        submitter_name: mast.submitter_name,
        vote_count: mast.vote_count,
        description: mast.description,
        height: mast.height,
        created_at: mast.created_at,
      }
    : null;

  return (
    <>
      <div
        className="hero-carousel relative w-full overflow-hidden select-none"
        style={{
          background: "#111a25",
          aspectRatio: "2/1",
          maxHeight: 600,
          cursor: mast ? "pointer" : "default",
        }}
        onClick={() => mast && setShowModal(true)}
      >
        {mast ? (
          <>
            <Image
              src={mast.image_url}
              alt={mast.title}
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              quality={75}
              preload
              style={{ objectFit: "cover" }}
            />
            {/* gradient overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 55%)",
              }}
            />
            {/* badge */}
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
            {/* caption */}
            <div className="absolute bottom-0 left-0 right-0 z-10 pb-6 flex flex-col items-center gap-0.5 px-4">
              <span
                className="text-white font-bold text-center"
                style={{ fontSize: "1.4em", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
              >
                {mast.title}
              </span>
              <span
                className="text-center"
                style={{ color: "rgba(255,255,255,0.82)", fontSize: "0.88em" }}
              >
                Submitted by {mast.submitter_name}
              </span>
              {mast.monthly_votes !== 0 && (
                <span
                  className="text-center"
                  style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.82em" }}
                >
                  {mast.monthly_votes > 0 ? "+" : ""}
                  {mast.monthly_votes} this month
                </span>
              )}
            </div>
          </>
        ) : (
          /* Placeholder when no masts yet */
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Lato, Arial, sans-serif" }}
          >
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1200 600"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden
              style={{ opacity: 0.12 }}
            >
              <TowerSvg cx={300} scale={0.85} />
              <TowerSvg cx={600} scale={1} />
              <TowerSvg cx={900} scale={0.75} />
            </svg>
            <span
              className="text-[1.1em] font-normal text-center px-4 py-1.5"
              style={{ background: "rgba(0,0,0,0.8)" }}
            >
              No masts submitted yet — be the first!
            </span>
          </div>
        )}
      </div>

      {showModal && towerForModal && (
        <TowerDetailModal
          tower={{ ...towerForModal, vote_count: towerForModal.vote_count + voteDelta }}
          voteDirection={voteDirection}
          onClose={() => setShowModal(false)}
          onVote={async (direction) => {
            const result = await submitVote(towerForModal.id, direction);
            if (!result) return;
            setVoteDelta((d) => d + result.delta);
            setVoteDirection(result.direction);
          }}
        />
      )}
    </>
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
