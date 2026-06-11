"use client";

import { useState, useEffect } from "react";
import { Tower } from "@/lib/types";
import { getOrCreateVoterId } from "@/lib/voter-id";

interface TowerCardProps {
  tower: Tower;
  voteDirection: "up" | "down" | null;
  onSelect: (tower: Tower) => void;
  onVoteSuccess: (direction: "up" | "down") => void;
}

export default function TowerCard({ tower, voteDirection: initialVoteDirection, onSelect, onVoteSuccess }: TowerCardProps) {
  const [votes, setVotes] = useState(tower.vote_count);
  const [voteDirection, setVoteDirection] = useState(initialVoteDirection);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    setVoteDirection(initialVoteDirection);
  }, [initialVoteDirection]);

  async function handleVote(direction: "up" | "down") {
    if (voteDirection !== null || voting) return;
    setVoting(true);
    const voterId = getOrCreateVoterId();
    try {
      const res = await fetch(`/api/towers/${tower.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voter_id: voterId, direction }),
      });
      if (res.ok) {
        setVotes((v) => direction === "up" ? v + 1 : v - 1);
        setVoteDirection(direction);
        onVoteSuccess(direction);
      }
    } finally {
      setVoting(false);
    }
  }

  const voted = voteDirection !== null;

  return (
    <article className="post hentry" itemScope itemType="http://schema.org/Photograph">
      <div onClick={() => onSelect(tower)} className="post-thumbnail-container" style={{ cursor: "pointer" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={tower.image_url} alt={tower.title} loading="lazy" />
      </div>
      <div className="featured-bar" />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flex: 1 }}>
        <header className="entry-header" style={{ marginBottom: 0, flex: 1, paddingRight: "1em", minWidth: 0 }}>
          <h2 className="entry-title" itemProp="name" style={{ fontSize: "1.1rem", marginBottom: "0.2rem", cursor: "pointer", color: "var(--text)" }} onClick={() => onSelect(tower)}>
            {tower.title}
          </h2>
          <div className="entry-meta" style={{ marginTop: "0.3em" }}>
            <span style={{ fontSize: "0.85em", color: "#666", fontStyle: "italic" }}>
              Submitted by <span itemProp="author" style={{ fontWeight: 600, color: "#333", fontStyle: "normal" }}>{tower.submitter_name}</span>
            </span>
          </div>
          {tower.description && (
            <div style={{ marginTop: "0.6em", fontSize: "0.85rem", color: "var(--text-mid)", lineHeight: 1.5, wordBreak: "break-word" }}>
              {tower.description.length > 160 ? (
                <>
                  {tower.description.replace(/\n/g, ' ').slice(0, 160).trim()}...{" "}
                  <span onClick={(e) => { e.stopPropagation(); onSelect(tower); }} style={{ color: "var(--orange)", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
                    Read more
                  </span>
                </>
              ) : (
                <>{tower.description.replace(/\n/g, ' ')}</>
              )}
            </div>
          )}
        </header>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", flexShrink: 0, paddingLeft: "0.5rem" }}>
          <button
            type="button"
            onClick={() => handleVote("up")}
            disabled={voted || voting}
            style={{
              background: voteDirection === "up" ? "var(--orange)" : "transparent",
              color: voteDirection === "up" ? "#fff" : "var(--text-mid)",
              border: `1px solid ${voteDirection === "up" ? "var(--orange)" : "var(--border)"}`,
              borderRadius: "4px",
              padding: "0.35rem 0.85rem",
              cursor: voted ? "default" : "pointer",
              fontWeight: 700,
              fontSize: "1.1rem",
              lineHeight: 1,
              transition: "all 0.15s",
            }}
          >
            ▲
          </button>
          <span style={{ fontWeight: 700, minWidth: "2ch", textAlign: "center", color: "var(--text)", fontSize: "1.1rem", lineHeight: 1 }}>
            {votes}
          </span>
          <button
            type="button"
            onClick={() => handleVote("down")}
            disabled={voted || voting}
            style={{
              background: voteDirection === "down" ? "var(--navy)" : "transparent",
              color: voteDirection === "down" ? "#fff" : "var(--text-mid)",
              border: `1px solid ${voteDirection === "down" ? "var(--navy)" : "var(--border)"}`,
              borderRadius: "4px",
              padding: "0.35rem 0.85rem",
              cursor: voted ? "default" : "pointer",
              fontWeight: 700,
              fontSize: "1.1rem",
              lineHeight: 1,
              transition: "all 0.15s",
            }}
          >
            ▼
          </button>
        </div>
      </div>
    </article>
  );
}
