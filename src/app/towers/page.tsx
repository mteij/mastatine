import sql from "@/lib/db";
import { Tower } from "@/lib/types";
import TowerGrid from "@/components/TowerGrid";
import Link from "next/link";

async function getAllTowers(): Promise<Tower[]> {
  try {
    return await sql<Tower[]>`
      SELECT * FROM towers ORDER BY vote_count DESC
    `;
  } catch {
    return [];
  }
}

export const revalidate = 30;

export default async function TowersPage() {
  const towers = await getAllTowers();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1a2332]">
            📡 Mast Gallery
          </h1>
          <p className="text-slate-500 mt-1">
            Browse and vote on the finest transmission towers submitted by the
            community.
          </p>
        </div>
        <Link
          href="/submit"
          className="bg-yellow-400 text-[#1a2332] font-bold px-5 py-2.5 rounded-lg hover:bg-yellow-300 transition-colors whitespace-nowrap"
        >
          + Submit a Mast
        </Link>
      </div>

      <TowerGrid initialTowers={towers} votedTowerIds={[]} />
    </div>
  );
}
