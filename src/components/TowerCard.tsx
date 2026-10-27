"use client";

import { useState } from "react";
import Image from "next/image";
import { Tower } from "@/lib/types";
import type { VoteDirection } from "@/lib/vote";

interface TowerCardProps {
  tower: Tower;
  voteDirection: VoteDirection | null;
  onSelect: (tower: Tower) => void;
  onVote: (direction: VoteDirection) => Promise<void>;
}

export default function TowerCard({ tower, voteDirection, onSelect, onVote }: TowerCardProps) {
  const [voting, setVoting] = useState(false);

  async function handleVote(direction: VoteDirection) {
    if (voting) return;
    setVoting(true);
    try {
      await onVote(direction);
    } finally {
      setVoting(false);
    }
  }

  return (
    <article className="post hentry" itemScope itemType="http://schema.org/Photograph">
      <div onClick={() => onSelect(tower)} className="post-thumbnail-container" style={{ cursor: "pointer", position: "relative" }}>
        {tower.height && tower.height > 0 && (
          <span style={{ 
            position: "absolute", 
            top: "0.8rem", 
            left: "0.8rem", 
            zIndex: 10,
            display: "flex", 
            alignItems: "center", 
            gap: "0.4em", 
            fontSize: "1rem", 
            fontWeight: 800, 
            color: "var(--navy)", 
            background: "rgba(255, 255, 255, 0.9)", 
            backdropFilter: "blur(4px)", 
            padding: "0.3em 0.8em", 
            borderRadius: "16px", 
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}>
            <Image src="/klok.png" alt="KLOK" width={32} height={32} style={{ height: "1.6em", width: "auto" }} />
            {Math.floor(tower.height / 0.168).toLocaleString("en-US")} KLOK high
          </span>
        )}
        <Image
          src={tower.image_url}
          alt={tower.title}
          width={800}
          height={600}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 400px"
          quality={60}
        />
      </div>
      <div className="featured-bar" />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flex: 1, overflow: "hidden" }}>
        <header className="entry-header" style={{ marginBottom: 0, flex: 1, paddingRight: "1em", minWidth: 0 }}>
          <h2 className="entry-title" itemProp="name" style={{ fontSize: "1.1rem", marginBottom: "0.2rem", cursor: "pointer", color: "var(--text)" }} onClick={() => onSelect(tower)}>
            {tower.title}
          </h2>
          <div className="entry-meta" style={{ marginTop: "0.3em", display: "flex", flexWrap: "wrap", gap: "0.8em", alignItems: "center" }}>
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
            disabled={voting}
            style={{
              background: voteDirection === "up" ? "var(--orange)" : "transparent",
              color: voteDirection === "up" ? "#fff" : "var(--text-mid)",
              border: `1px solid ${voteDirection === "up" ? "var(--orange)" : "var(--border)"}`,
              borderRadius: "4px",
              padding: "0.35rem 0.85rem",
              cursor: voting ? "default" : "pointer",
              fontWeight: 700,
              fontSize: "1.1rem",
              lineHeight: 1,
              transition: "all 0.15s",
            }}
          >
            ▲
          </button>
          <span style={{ fontWeight: 700, minWidth: "2ch", textAlign: "center", color: "var(--text)", fontSize: "1.1rem", lineHeight: 1 }}>
            {tower.vote_count}
          </span>
          <button
            type="button"
            onClick={() => handleVote("down")}
            disabled={voting}
            style={{
              background: voteDirection === "down" ? "var(--navy)" : "transparent",
              color: voteDirection === "down" ? "#fff" : "var(--text-mid)",
              border: `1px solid ${voteDirection === "down" ? "var(--navy)" : "var(--border)"}`,
              borderRadius: "4px",
              padding: "0.35rem 0.85rem",
              cursor: voting ? "default" : "pointer",
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
