"use client";

import { useState, useEffect } from "react";
import { Tower } from "@/lib/types";
import { getOrCreateVoterId } from "@/lib/voter-id";

interface TowerDetailModalProps {
  tower: Tower;
  initialVoteDirection: "up" | "down" | null;
  onClose: () => void;
  onVoteSuccess: (direction: "up" | "down" | null) => void;
}

export default function TowerDetailModal({ tower, initialVoteDirection, onClose, onVoteSuccess }: TowerDetailModalProps) {
  const [votes, setVotes] = useState(tower.vote_count);
  const [voteDirection, setVoteDirection] = useState<"up" | "down" | null>(initialVoteDirection);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    setVoteDirection(initialVoteDirection);
  }, [initialVoteDirection]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function handleVote(direction: "up" | "down") {
    if (voting) return;
    setVoting(true);
    const voterId = getOrCreateVoterId();
    try {
      const res = await fetch(`/api/towers/${tower.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voter_id: voterId, direction }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.action === "unvoted") {
          setVotes((v) => direction === "up" ? v - 1 : v + 1);
          setVoteDirection(null);
          onVoteSuccess(null);
        } else if (data.action === "changed") {
          setVotes((v) => direction === "up" ? v + 2 : v - 2);
          setVoteDirection(direction);
          onVoteSuccess(direction);
        } else {
          setVotes((v) => direction === "up" ? v + 1 : v - 1);
          setVoteDirection(direction);
          onVoteSuccess(direction);
        }
      }
    } finally {
      setVoting(false);
    }
  }

  return (
    <div className="tm-backdrop" onClick={onClose}>
      <div className="tm-box" onClick={(e) => e.stopPropagation()}>

        {/* Close */}
        <button className="tm-close" onClick={onClose} aria-label="Close">×</button>

        <div className="tm-scroll">
          {/* Image */}
          <div className="tm-img-wrap">
            {tower.height && tower.height > 0 && (
              <span className="tm-klok-badge">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/klok.png" alt="KLOK" style={{ height: "1.4em", width: "auto" }} />
                {Math.floor(tower.height / 0.168).toLocaleString("en-US")} KLOK
                <span style={{ opacity: 0.6, fontWeight: 500, fontSize: "0.85em" }}>
                  · {tower.height} m
                </span>
              </span>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="tm-img" src={tower.image_url} alt={tower.title} />
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
                <span className="tm-vote-count">{votes}</span>
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
    </div>
  );
}
