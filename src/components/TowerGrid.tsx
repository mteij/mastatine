"use client";

import { useEffect, useState } from "react";
import TowerCard from "./TowerCard";
import { Tower } from "@/lib/types";
import { getOrCreateVoterId } from "@/lib/voter-id";

type SortOption = "votes" | "newest";

interface TowerGridProps {
  initialTowers: Tower[];
  votedTowerIds: string[];
}

export default function TowerGrid({ initialTowers, votedTowerIds: initialVotedIds }: TowerGridProps) {
  const [towers, setTowers] = useState(initialTowers);
  const [sort, setSort] = useState<SortOption>("votes");
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set(initialVotedIds));

  useEffect(() => {
    const voterId = getOrCreateVoterId();
    if (!voterId) return;

    fetch(`/api/votes?voter_id=${voterId}`)
      .then((r) => r.json())
      .then((data: { tower_ids: string[] }) => {
        setVotedIds(new Set(data.tower_ids));
      })
      .catch(() => {});
  }, []);

  const sorted = [...towers].sort((a, b) => {
    if (sort === "votes") return b.vote_count - a.vote_count;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-500 text-sm">{towers.length} mast{towers.length !== 1 ? "s" : ""} submitted</p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="votes">Most voted</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-6xl mb-4">📡</div>
          <p className="text-lg font-medium">No masts yet.</p>
          <p className="text-sm mt-1">Be the first to submit one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((tower) => (
            <TowerCard
              key={tower.id}
              tower={tower}
              hasVoted={votedIds.has(tower.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
