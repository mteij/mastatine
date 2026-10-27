"use client";

import { useState } from "react";
import Image from "next/image";
import { Tower } from "@/lib/types";
import { toKlok } from "@/lib/klok";
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

  const hasHeight = tower.height != null && tower.height > 0;

  return (
    <article className="mast-card" itemScope itemType="http://schema.org/Photograph">
      <button type="button" className="mast-card__media" onClick={() => onSelect(tower)} aria-label={`Open ${tower.title}`}>
        <Image
          src={tower.image_url}
          alt={tower.title}
          width={800}
          height={600}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 400px"
          quality={60}
        />
        {hasHeight && (
          <span className="mast-card__klok">
            <Image src="/klok.png" alt="" width={32} height={32} />
            {toKlok(tower.height!).toLocaleString("en-US")} KLOK
          </span>
        )}
      </button>

      <div className="mast-card__body">
        <h2 className="mast-card__title" itemProp="name">
          <button type="button" onClick={() => onSelect(tower)}>
            {tower.title}
          </button>
        </h2>
        <p className="mast-card__meta">
          by <span itemProp="author">{tower.submitter_name}</span>
        </p>
        {tower.description && <p className="mast-card__desc">{tower.description}</p>}

        <div className="mast-card__foot">
          <div className="vote" role="group" aria-label={`Vote on ${tower.title}`}>
            <button
              type="button"
              className="up"
              aria-pressed={voteDirection === "up"}
              aria-label="Upvote"
              disabled={voting}
              onClick={() => handleVote("up")}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path d="M7 3 2.5 10h9z" fill="currentColor" />
              </svg>
            </button>
            <output aria-live="polite">{tower.vote_count}</output>
            <button
              type="button"
              className="down"
              aria-pressed={voteDirection === "down"}
              aria-label="Downvote"
              disabled={voting}
              onClick={() => handleVote("down")}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path d="M7 11 2.5 4h9z" fill="currentColor" />
              </svg>
            </button>
          </div>
          <button type="button" className="mast-card__more" onClick={() => onSelect(tower)}>
            Details
          </button>
        </div>
      </div>
    </article>
  );
}
