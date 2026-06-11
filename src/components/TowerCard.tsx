"use client";

import { useState } from "react";
import Image from "next/image";
import { Tower } from "@/lib/types";
import { getOrCreateVoterId } from "@/lib/voter-id";

interface TowerCardProps {
  tower: Tower;
  hasVoted: boolean;
}

export default function TowerCard({ tower, hasVoted: initialHasVoted }: TowerCardProps) {
  const [votes, setVotes] = useState(tower.vote_count);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [voting, setVoting] = useState(false);

  async function handleVote() {
    if (hasVoted || voting) return;
    setVoting(true);

    const voterId = getOrCreateVoterId();
    try {
      const res = await fetch(`/api/towers/${tower.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voter_id: voterId }),
      });

      if (res.ok) {
        setVotes((v) => v + 1);
        setHasVoted(true);
      }
    } finally {
      setVoting(false);
    }
  }

  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 flex flex-col group hover:shadow-lg transition-shadow">
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <Image
          src={tower.image_url}
          alt={tower.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
        <div className="absolute top-2 right-2">
          <span className="bg-[#f57f20] text-white text-xs font-bold px-2 py-1 rounded-full shadow">
            📡 Mast
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h2 className="font-bold text-slate-800 text-lg leading-tight mb-1 line-clamp-2">
          {tower.title}
        </h2>
        {tower.description && (
          <p className="text-slate-500 text-sm mb-3 line-clamp-3 flex-1">
            {tower.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            by <span className="font-medium text-slate-600">{tower.submitter_name}</span>
          </span>

          <button
            onClick={handleVote}
            disabled={hasVoted || voting}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              hasVoted
                ? "bg-orange-100 text-orange-700 cursor-default"
                : "bg-[#1a2332] text-white hover:bg-[#f57f20] hover:text-white active:scale-95"
            } disabled:opacity-70`}
          >
            <span>{hasVoted ? "⚡" : "▲"}</span>
            <span>{votes}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
