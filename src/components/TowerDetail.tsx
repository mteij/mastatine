"use client";

import { useState } from "react";
import { Tower } from "@/lib/types";
import { getOrCreateVoterId } from "@/lib/voter-id";
import Link from "next/link";

interface TowerDetailProps {
  tower: Tower;
}

export default function TowerDetail({ tower }: TowerDetailProps) {
  const [votes, setVotes] = useState(tower.vote_count);
  const [voteDirection, setVoteDirection] = useState<"up" | "down" | null>(null);
  const [voting, setVoting] = useState(false);

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
      }
    } finally {
      setVoting(false);
    }
  }

  const voted = voteDirection !== null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <Link href="/#towers" style={{ color: "var(--orange)", fontWeight: "bold", textDecoration: "none", fontSize: "1.2rem" }}>
        ← Back to Masts
      </Link>
      
      <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={tower.image_url} 
          alt={tower.title} 
          style={{ width: "100%", maxHeight: "65vh", objectFit: "contain", backgroundColor: "#111" }} 
        />
        
        <div style={{ padding: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <h1 style={{ fontSize: "2.8rem", margin: "0 0 0.5rem", color: "var(--text)" }}>{tower.title}</h1>
              <p style={{ color: "var(--text-mid)", fontSize: "1.2rem", margin: 0 }}>
                Submitted by <strong>{tower.submitter_name}</strong>
              </p>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#f8f9fa", padding: "0.5rem 1rem", borderRadius: "8px" }}>
              <button
                type="button"
                onClick={() => handleVote("up")}
                disabled={voted || voting}
                style={{
                  background: voteDirection === "up" ? "var(--orange)" : "transparent",
                  color: voteDirection === "up" ? "#fff" : "var(--text-mid)",
                  border: `1px solid ${voteDirection === "up" ? "var(--orange)" : "var(--border)"}`,
                  borderRadius: "4px",
                  padding: "0.5rem 1rem",
                  cursor: voted ? "default" : "pointer",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  transition: "all 0.2s",
                }}
              >
                ▲
              </button>
              <span style={{ fontWeight: 700, minWidth: "3ch", textAlign: "center", fontSize: "1.5rem" }}>
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
                  padding: "0.5rem 1rem",
                  cursor: voted ? "default" : "pointer",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  transition: "all 0.2s",
                }}
              >
                ▼
              </button>
            </div>
          </div>
          
          {tower.description && (
            <div style={{ marginTop: "2.5rem", paddingTop: "2.5rem", borderTop: "1px solid var(--border)", fontSize: "1.2rem", lineHeight: 1.6 }}>
              <p>{tower.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
