import sql from "@/lib/db";
import MastatineLogo from "@/components/MastatineLogo";
import DashboardGreeting from "@/components/DashboardGreeting";
import { getThisWeekActivities } from "@/lib/calendar";

interface DashboardStats {
  towerCount: number;
  voteCount: number;
}

async function getStats(): Promise<DashboardStats> {
  try {
    const [row] = await sql<{ towers: number; votes: number }[]>`
      SELECT
        (SELECT COUNT(*) FROM towers)::int AS towers,
        (SELECT COUNT(*) FROM votes)::int AS votes
    `;
    return { towerCount: row?.towers ?? 0, voteCount: row?.votes ?? 0 };
  } catch {
    return { towerCount: 0, voteCount: 0 };
  }
}

export default async function MastAppsDashboard() {
  const [stats, activities] = await Promise.all([getStats(), getThisWeekActivities()]);

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      {/* ── Top bar ── */}
      <div className="bg-white flex items-center justify-between px-6 py-4 gap-4 flex-wrap">
        <a href="/" className="flex items-center gap-2 shrink-0">
          <MastatineLogo size={40} />
        </a>
        <div className="flex-1 max-w-xl">
          <input
            type="search"
            placeholder="Start typing to search for masts..."
            className="w-full bg-slate-100 rounded-full px-5 py-2.5 text-sm text-slate-700 outline-none"
          />
        </div>
        <div className="text-slate-700 shrink-0">
          Hey, <span className="text-[#f57f20] font-bold">mastende engineer!</span>
        </div>
      </div>

      {/* ── Hero banner ── */}
      <div
        className="px-6 py-14 flex items-end justify-between flex-wrap gap-4"
        style={{ background: "linear-gradient(120deg, var(--navy), #16307a)" }}
      >
        <DashboardGreeting />
        <p className="text-white/80 italic text-sm md:text-base">
          No mast inspections scheduled today.
        </p>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
        {/* Webapps */}
        <div className="space-y-4">
          <h2 className="text-center text-2xl font-black text-[#f57f20] mb-6">Webapps</h2>
          <a
            href="/mastapps/mast-builder"
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex overflow-hidden max-w-sm"
          >
            <div
              className="w-10 shrink-0 flex items-center justify-center text-white font-bold text-xs tracking-widest"
              style={{
                background: "linear-gradient(to bottom, var(--navy), var(--orange))",
                writingMode: "vertical-rl",
              }}
            >
              MASTAPP
            </div>
            <div className="p-4">
              <h3 className="text-[#f57f20] font-bold">Mast Builder</h3>
              <p className="text-slate-600 text-sm mt-1">
                Build your mast segment by segment, dodge the storms, chase the record.
              </p>
            </div>
          </a>
          <a
            href="/shop"
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex overflow-hidden max-w-sm"
          >
            <div
              className="w-10 shrink-0 flex items-center justify-center text-white font-bold text-xs tracking-widest"
              style={{
                background: "linear-gradient(to bottom, var(--navy), var(--orange))",
                writingMode: "vertical-rl",
              }}
            >
              SHOP
            </div>
            <div className="p-4">
              <h3 className="text-[#f57f20] font-bold">Merch Shop</h3>
              <p className="text-slate-600 text-sm mt-1">
                Official Mastatine t-shirts, hoodies, and more — printed to order.
              </p>
            </div>
          </a>
        </div>

        {/* Widgets */}
        <div className="space-y-6">
          <h2 className="text-center text-2xl font-black text-[#f57f20] mb-0">Widgets</h2>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-[#f57f20] font-bold mb-4">Activities This Week</h3>
            {activities.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-2">
                No activities scheduled this week.
              </p>
            ) : (
              <div className="space-y-3">
                {activities.flatMap((day) => {
                  const d = new Date(day.date);
                  const dayNum = d.getDate().toString().padStart(2, "0");
                  const weekday = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
                  return day.events.map((ev, i) => (
                    <div key={`${day.date}-${i}`} className="flex items-center gap-3">
                      <div className="border border-[#f57f20] rounded-lg text-center px-2 py-1 shrink-0 leading-tight">
                        <div className="text-[#f57f20] font-bold text-sm">{dayNum}</div>
                        <div className="text-[10px] text-slate-500">{weekday}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">{ev.title}</div>
                        {ev.location && (
                          <div className="text-xs text-slate-500">{ev.location}</div>
                        )}
                      </div>
                    </div>
                  ));
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-[#f57f20] font-bold mb-4">Tower Stats</h3>
            <div className="flex justify-around text-center">
              <div>
                <div className="text-2xl font-black text-[#1a2332]">{stats.towerCount}</div>
                <div className="text-xs text-slate-500">Masts submitted</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#1a2332]">{stats.voteCount}</div>
                <div className="text-xs text-slate-500">Votes cast</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer band ── */}
      <div className="bg-[#f57f20] py-10 flex flex-col items-center gap-2 mt-4">
        <MastatineLogo size={48} mono className="text-white" />
        <div className="text-white font-black text-xl">S.A. MASTATINE</div>
        <div className="text-white/90 text-sm">Powered by Next.js &amp; Supabase.</div>
        <div className="text-white/90 text-sm">Copyright 2026.</div>
      </div>
    </div>
  );
}
