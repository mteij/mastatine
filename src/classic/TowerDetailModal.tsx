"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Tower } from "@/lib/types";
import type { VoteDirection } from "@/lib/vote";

interface TowerDetailModalProps {
  tower: Tower;
  voteDirection: VoteDirection | null;
  onClose: () => void;
  onVote: (direction: VoteDirection) => Promise<void>;
}

export default function TowerDetailModal({ tower, voteDirection, onClose, onVote }: TowerDetailModalProps) {
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function handleVote(direction: VoteDirection) {
    if (voting) return;
    setVoting(true);
    try {
      await onVote(direction);
    } finally {
      setVoting(false);
    }
  }

  // Rendered on <body>: inside the page, the entrance animation of #main traps the z-index below the menu.
  return createPortal(
    <div className="tm-backdrop" onClick={onClose}>
      <div className="tm-box" onClick={(e) => e.stopPropagation()}>

        {/* Close */}
        <button className="tm-close" onClick={onClose} aria-label="Close">×</button>

        <div className="tm-scroll">
          {/* Image */}
          <div className="tm-img-wrap">
            {tower.height && tower.height > 0 && (
              <span className="tm-klok-badge">
                <Image src="/klok.png" alt="KLOK" width={32} height={32} style={{ height: "1.4em", width: "auto" }} />
                {Math.floor(tower.height / 0.168).toLocaleString("en-US")} KLOK
                <span style={{ opacity: 0.6, fontWeight: 500, fontSize: "0.85em" }}>
                  · {tower.height} m
                </span>
              </span>
            )}
            <Image
              className="tm-img"
              src={tower.image_url}
              alt={tower.title}
              width={1600}
              height={900}
              sizes="(max-width: 900px) 100vw, 800px"
              quality={75}
              preload
            />
          </div>

          {/* Content */}
          <div className="tm-content">

            {/* Info row: title + votes */}
            <div className="tm-info-row">
              <div className="tm-text">
                <h2 className="tm-title">{tower.title}</h2>
                <p className="tm-submitter">
                  Submitted by <strong>{tower.submitter_name}</strong>
                </p>
              </div>

              <div className="tm-votes">
                <button
                  className="tm-vote-btn"
                  type="button"
                  onClick={() => handleVote("up")}
                  disabled={voting}
                  style={{
                    background: voteDirection === "up" ? "var(--orange)" : "transparent",
                    color: voteDirection === "up" ? "#fff" : "var(--text-mid)",
                  }}
                  aria-label="Upvote"
                >
                  ▲
                </button>
                <span className="tm-vote-count">{tower.vote_count}</span>
                <button
                  className="tm-vote-btn"
                  type="button"
                  onClick={() => handleVote("down")}
                  disabled={voting}
                  style={{
                    background: voteDirection === "down" ? "var(--navy)" : "transparent",
                    color: voteDirection === "down" ? "#fff" : "var(--text-mid)",
                  }}
                  aria-label="Downvote"
                >
                  ▼
                </button>
              </div>
            </div>

            {tower.description && (
              <div className="tm-description">
                <p>{tower.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
