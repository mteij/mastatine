"use client";

import { useEffect, useState } from "react";
import TowerCard from "./TowerCard";
import TowerDetailModal from "./TowerDetailModal";
import { Tower } from "@/lib/types";
import { getOrCreateVoterId } from "@/lib/voter-id";

interface TowerGridProps {
  initialTowers: Tower[];
  children?: React.ReactNode;
}

export default function TowerGrid({ initialTowers, children }: TowerGridProps) {
  const [voteMap, setVoteMap] = useState<Map<string, "up" | "down">>(new Map());
  const [selectedTower, setSelectedTower] = useState<Tower | null>(null);

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
      <div className="content-masonry">
        {children}
        {initialTowers.map((tower) => (
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
