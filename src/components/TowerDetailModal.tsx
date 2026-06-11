"use client";

import { useState, useEffect } from "react";
import { Tower } from "@/lib/types";
import { getOrCreateVoterId } from "@/lib/voter-id";

interface TowerDetailModalProps {
  tower: Tower;
  initialVoteDirection: "up" | "down" | null;
  onClose: () => void;
  onVoteSuccess: (direction: "up" | "down") => void;
}

export default function TowerDetailModal({ tower, initialVoteDirection, onClose, onVoteSuccess }: TowerDetailModalProps) {
  const [votes, setVotes] = useState(tower.vote_count);
  const [voteDirection, setVoteDirection] = useState<"up" | "down" | null>(initialVoteDirection);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    setVoteDirection(initialVoteDirection);
  }, [initialVoteDirection]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        backdropFilter: "blur(5px)"
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          width: "100%",
          maxWidth: "1000px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "rgba(0,0,0,0.5)",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            fontSize: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10
          }}
        >
          ×
        </button>

        <div style={{ overflowY: "auto", flex: 1 }}>
          <div style={{ position: "relative" }}>
            {tower.height && tower.height > 0 && (
              <span style={{ 
                position: "absolute", 
                top: "1.5rem", 
                left: "1.5rem", 
                zIndex: 10,
                display: "flex", 
                alignItems: "center", 
                gap: "0.5em", 
                fontSize: "1.4rem", 
                fontWeight: 800, 
                color: "var(--navy)", 
                background: "rgba(255, 255, 255, 0.9)", 
                backdropFilter: "blur(5px)", 
                padding: "0.4em 1em", 
                borderRadius: "24px", 
                boxShadow: "0 6px 16px rgba(0,0,0,0.2)"
              }}>
                <img src="/klok.png" alt="KLOK" style={{ height: "1.8em", width: "auto" }} />
                {Math.floor(tower.height / 0.168).toLocaleString()} KLOK high
              </span>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={tower.image_url} 
              alt={tower.title} 
              style={{ width: "100%", maxHeight: "55vh", objectFit: "contain", backgroundColor: "#111", display: "block" }} 
            />
          </div>
          
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
    </div>
  );
}
