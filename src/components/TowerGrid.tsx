"use client";

import { useEffect, useState, useMemo } from "react";
import TowerCard from "./TowerCard";
import TowerDetailModal from "./TowerDetailModal";
import { Tower } from "@/lib/types";
import { getOrCreateVoterId } from "@/lib/voter-id";

type SortKey = "rating" | "newest" | "height";

const SORT_LABELS: Record<SortKey, string> = {
  rating: "Rating",
  newest: "Newest",
  height: "Height",
};

interface TowerGridProps {
  initialTowers: Tower[];
  children?: React.ReactNode;
}

export default function TowerGrid({ initialTowers, children }: TowerGridProps) {
  const [voteMap, setVoteMap] = useState<Map<string, "up" | "down">>(new Map());
  const [selectedTower, setSelectedTower] = useState<Tower | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchValue(params.get("s") ?? "");
  }, []);

  const sortedTowers = useMemo(() => {
    const copy = [...initialTowers];
    if (sortKey === "newest") {
      copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortKey === "height") {
      copy.sort((a, b) => (b.height ?? -Infinity) - (a.height ?? -Infinity));
    } else {
      copy.sort((a, b) => b.vote_count - a.vote_count);
    }
    return copy;
  }, [initialTowers, sortKey]);

  const visibleTowers = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return sortedTowers;
    return sortedTowers.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.submitter_name.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q)
    );
  }, [sortedTowers, searchValue]);

  useEffect(() => {
    const voterId = getOrCreateVoterId();
    fetch(`/api/votes?voter_id=${voterId}`)
      .then((r) => r.json())
      .then((data: { tower_votes: { tower_id: string; direction: "up" | "down" }[] }) => {
        setVoteMap(new Map(data.tower_votes.map((v) => [v.tower_id, v.direction])));
      })
      .catch(() => {});
  }, []);

  const handleVoteSuccess = (towerId: string, direction: "up" | "down" | null) => {
    setVoteMap((prev) => {
      const newMap = new Map(prev);
      if (direction === null) {
        newMap.delete(towerId);
      } else {
        newMap.set(towerId, direction);
      }
      return newMap;
    });
  };

  if (initialTowers.length === 0 && !children) {
    return null;
  }

  return (
    <>
      <div className="justify-center lg:justify-between" style={{ display: "flex", alignItems: "center", padding: "1rem 0", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              style={{
                padding: "0.4rem 1.1rem",
                borderRadius: "20px",
                border: `2px solid ${sortKey === key ? "#fff" : "rgba(255,255,255,0.45)"}`,
                background: sortKey === key ? "#fff" : "transparent",
                color: sortKey === key ? "var(--orange)" : "#fff",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {SORT_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Desktop-only live search */}
        <div
          className="hidden lg:flex"
          style={{
            border: "2px solid rgba(255,255,255,0.6)",
            borderRadius: "25px",
            overflow: "hidden",
            background: "rgba(255,255,255,0.15)",
            flexShrink: 0,
            alignItems: "center",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "0.9em", flexShrink: 0, opacity: 0.8 }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search masts…"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{
              padding: "0.4em 1em",
              fontSize: "0.9em",
              color: "#fff",
              outline: "none",
              border: "none",
              background: "transparent",
              width: "180px",
            }}
          />
        </div>
      </div>

      <div className="content-masonry">
        {children}
        {visibleTowers.map((tower) => (
          <TowerCard
            key={tower.id}
            tower={tower}
            voteDirection={voteMap.get(tower.id) ?? null}
            onSelect={setSelectedTower}
            onVoteSuccess={(dir) => handleVoteSuccess(tower.id, dir)}
          />
        ))}
      </div>
      
      {selectedTower && (
        <TowerDetailModal 
          tower={selectedTower} 
          initialVoteDirection={voteMap.get(selectedTower.id) ?? null}
          onClose={() => setSelectedTower(null)} 
          onVoteSuccess={(dir) => handleVoteSuccess(selectedTower.id, dir)}
        />
      )}
    </>
  );
}
