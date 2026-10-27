"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TowerCard from "./TowerCard";
import TowerDetailModal from "./TowerDetailModal";
import { Tower } from "@/lib/types";
import { getOrCreateVoterId } from "@/lib/voter-id";
import { submitVote, type VoteDirection } from "@/lib/vote";
import type { SortKey, TowerPage } from "@/lib/towers";

const SORT_LABELS: Record<SortKey, string> = {
  rating: "Rating",
  newest: "Newest",
  height: "Height",
};

const SEARCH_DEBOUNCE_MS = 250;

interface TowerGridProps {
  initialPage: TowerPage;
  initialQuery: string;
  children?: React.ReactNode;
}

async function fetchPage(sort: SortKey, q: string, offset: number): Promise<TowerPage> {
  const params = new URLSearchParams({ sort, q, offset: String(offset) });
  const res = await fetch(`/api/towers?${params}`);
  if (!res.ok) throw new Error(`Failed to load towers (${res.status})`);
  return res.json();
}

export default function TowerGrid({ initialPage, initialQuery, children }: TowerGridProps) {
  const [towers, setTowers] = useState<Tower[]>(initialPage.towers);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [loading, setLoading] = useState(false);
  const [voteMap, setVoteMap] = useState<Map<string, VoteDirection>>(new Map());
  const [selectedTower, setSelectedTower] = useState<Tower | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [searchValue, setSearchValue] = useState(initialQuery);

  const requestId = useRef(0);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const sentinel = useRef<HTMLDivElement>(null);

  // Replaces the list (offset 0) or appends the next page; stale responses are dropped.
  const load = useCallback(async (sort: SortKey, q: string, offset: number) => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const page = await fetchPage(sort, q, offset);
      if (id !== requestId.current) return;
      setTowers((prev) =>
        offset === 0 ? page.towers : [...prev, ...page.towers.filter((t) => !prev.some((p) => p.id === t.id))],
      );
      setHasMore(page.hasMore);
    } catch (error) {
      if (id === requestId.current) console.error(error);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  function changeSort(key: SortKey) {
    setSortKey(key);
    void load(key, searchValue.trim(), 0);
  }

  function changeSearch(value: string) {
    setSearchValue(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => void load(sortKey, value.trim(), 0), SEARCH_DEBOUNCE_MS);
  }

  useEffect(() => () => clearTimeout(searchTimer.current), []);

  // Infinite scroll: fetch the next page when the sentinel nears the viewport.
  const towerCount = towers.length;
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) void load(sortKey, searchValue.trim(), towerCount);
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, towerCount, sortKey, searchValue, load]);

  useEffect(() => {
    const voterId = getOrCreateVoterId();
    fetch(`/api/votes?voter_id=${voterId}`)
      .then((r) => r.json())
      .then((data: { tower_votes: { tower_id: string; direction: VoteDirection }[] }) => {
        setVoteMap(new Map(data.tower_votes.map((v) => [v.tower_id, v.direction])));
      })
      .catch(() => {});
  }, []);

  const handleVote = useCallback(async (towerId: string, direction: VoteDirection) => {
    const result = await submitVote(towerId, direction);
    if (!result) return;
    setTowers((prev) => prev.map((t) => (t.id === towerId ? { ...t, vote_count: t.vote_count + result.delta } : t)));
    setVoteMap((prev) => {
      const next = new Map(prev);
      if (result.direction === null) next.delete(towerId);
      else next.set(towerId, result.direction);
      return next;
    });
  }, []);

  // Prefer the live copy so the open modal reflects vote changes.
  const openTower = selectedTower ? (towers.find((t) => t.id === selectedTower.id) ?? selectedTower) : null;

  return (
    <>
      <div className="justify-center lg:justify-between" style={{ display: "flex", alignItems: "center", padding: "1rem 0", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => changeSort(key)}
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
            onChange={(e) => changeSearch(e.target.value)}
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
        {towers.map((tower) => (
          <TowerCard
            key={tower.id}
            tower={tower}
            voteDirection={voteMap.get(tower.id) ?? null}
            onSelect={setSelectedTower}
            onVote={(direction) => handleVote(tower.id, direction)}
          />
        ))}
      </div>

      {towers.length === 0 && !loading && searchValue.trim() && (
        <p style={{ color: "#fff", textAlign: "center", padding: "2rem 0", fontWeight: 700 }}>
          No masts found for &ldquo;{searchValue.trim()}&rdquo;.
        </p>
      )}

      {hasMore && <div ref={sentinel} aria-hidden style={{ height: 1 }} />}

      {openTower && (
        <TowerDetailModal
          tower={openTower}
          voteDirection={voteMap.get(openTower.id) ?? null}
          onClose={() => setSelectedTower(null)}
          onVote={(direction) => handleVote(openTower.id, direction)}
        />
      )}
    </>
  );
}
