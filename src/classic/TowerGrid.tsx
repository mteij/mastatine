"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TowerCard from "./TowerCard";
import TowerDetailModal from "./TowerDetailModal";
import { Tower } from "@/lib/types";
import { getOrCreateVoterId } from "@/lib/voter-id";
import { submitVote, type VoteDirection } from "@/lib/vote";
import type { SortKey, TowerPage } from "@/lib/towers";
import { MASTS_CHANGED_EVENT } from "@/lib/events";

const SORT_LABELS: Record<SortKey, string> = {
  rating: "Top rated",
  newest: "Newest",
  height: "Tallest",
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

  // A new mast was submitted: reload from the top so it shows up.
  const currentSort = useRef(sortKey);
  const currentQuery = useRef(searchValue);
  useEffect(() => {
    currentSort.current = sortKey;
    currentQuery.current = searchValue;
  });
  useEffect(() => {
    const reload = () => void load(currentSort.current, currentQuery.current.trim(), 0);
    window.addEventListener(MASTS_CHANGED_EVENT, reload);
    return () => window.removeEventListener(MASTS_CHANGED_EVENT, reload);
  }, [load]);

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

  const query = searchValue.trim();

  return (
    <>
      <div className="grid-controls">
        <div className="seg" role="group" aria-label="Sort masts">
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <button key={key} type="button" aria-pressed={sortKey === key} onClick={() => changeSort(key)}>
              {SORT_LABELS[key]}
            </button>
          ))}
        </div>

        <label className="searchbox">
          <span className="sr-only">Search masts</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input type="search" placeholder="Search masts" value={searchValue} maxLength={100} onChange={(e) => changeSearch(e.target.value)} />
        </label>
      </div>

      <div className={`content-masonry${loading ? " is-loading" : ""}`}>
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
        {loading && towers.length > 0 && hasMore && (
          <>
            <div className="skeleton" aria-hidden />
            <div className="skeleton" aria-hidden />
          </>
        )}
      </div>

      {towers.length === 0 && !loading && query && (
        <p className="grid-empty">No masts found for &ldquo;{query}&rdquo;.</p>
      )}

      <p className="sr-only" role="status">
        {loading ? "Loading masts" : ""}
      </p>

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
