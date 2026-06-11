import sql from "@/lib/db";
import { Tower } from "@/lib/types";
import MastatineLogo from "@/components/MastatineLogo";
import TowerGrid from "@/components/TowerGrid";
import SubmitForm from "@/components/SubmitForm";

async function getTowers(): Promise<Tower[]> {
  try {
    return await sql<Tower[]>`SELECT * FROM towers ORDER BY vote_count DESC`;
  } catch {
    return [];
  }
}

async function getTowerCount(): Promise<number> {
  try {
    const [row] = await sql`SELECT COUNT(*)::int AS count FROM towers`;
    return row?.count ?? 0;
  } catch {
    return 0;
  }
}

export const revalidate = 30;

export default async function HomePage() {
  const [towers, towerCount] = await Promise.all([getTowers(), getTowerCount()]);

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════ */}
      <section
        id="home"
        className="bg-[#1b2539] text-white relative overflow-hidden"
      >
        {/* Decorative background tower silhouettes */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" aria-hidden>
          <svg
            viewBox="0 0 800 500"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            {[80, 240, 400, 560, 720].map((cx, i) => (
              <TowerSilhouette key={i} cx={cx} />
            ))}
          </svg>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-20 flex flex-col items-center text-center">
          <MastatineLogo size={140} />
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mt-6 mb-3">
            S.A. <span className="text-[#e8b800]">Mastatine</span>
          </h1>
          <p className="text-slate-300 text-lg italic mb-2">
            Studievereniging voor Gevorderde Masttechnologie
          </p>
          <p className="text-slate-400 max-w-lg text-sm mb-10">
            The world&apos;s premier academic association for the documentation,
            appreciation, and ranking of transmission towers, communication
            masts, and all electromagnetic structures.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#towers"
              className="bg-[#e8b800] text-[#1b2539] font-bold px-8 py-3 rounded-lg hover:bg-yellow-300 transition-colors"
            >
              Browse Masts
            </a>
            <a
              href="#submit"
              className="border-2 border-white/25 text-white font-bold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              Submit a Mast
            </a>
          </div>

          {towerCount > 0 && (
            <p className="mt-8 text-slate-500 text-xs">
              {towerCount} mast{towerCount !== 1 ? "s" : ""} catalogued so far
            </p>
          )}
        </div>
      </section>

      {/* Warning tape stripe */}
      <div
        className="h-3 shrink-0"
        style={{
          background:
            "repeating-linear-gradient(45deg,#e8b800 0,#e8b800 10px,#1b2539 10px,#1b2539 20px)",
        }}
      />

      {/* ═══════════════════════════════════════════════════
          TOWER GALLERY
      ═══════════════════════════════════════════════════ */}
      <section id="towers" className="bg-white py-14 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-black text-[#1b2539]">
                Mast Gallery
              </h2>
              <p className="text-slate-500 mt-1 text-sm">
                Browse, vote, and celebrate the finest transmission towers
                submitted by our community.
              </p>
            </div>
            <a
              href="#submit"
              className="shrink-0 bg-[#1b2539] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#e8b800] hover:text-[#1b2539] transition-colors text-sm"
            >
              + Submit a Mast
            </a>
          </div>

          <TowerGrid initialTowers={towers} votedTowerIds={[]} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SUBMIT
      ═══════════════════════════════════════════════════ */}
      <section
        id="submit"
        className="bg-[#f5f6fa] border-t border-slate-200 py-14 scroll-mt-16"
      >
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-[#1b2539] mb-2">
              Submit a Mast
            </h2>
            <p className="text-slate-500 text-sm">
              Found an impressive transmission tower, antenna mast, or other
              electromagnetic structure? Add it to the Mastatine registry.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-5">
            <SubmitForm />
          </div>

          <div className="bg-[#fffbe6] border border-[#e8b800]/40 rounded-xl p-4">
            <h3 className="font-bold text-[#92701a] text-sm mb-1">
              📋 Submission Guidelines
            </h3>
            <ul className="text-[#92701a] text-sm space-y-1">
              <li>• Must be a real transmission tower, mast, or antenna</li>
              <li>• Photo must clearly show the mast</li>
              <li>• Add a descriptive or entertaining title</li>
              <li>• No duplicates — check the gallery first</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          ABOUT
      ═══════════════════════════════════════════════════ */}
      <section
        id="about"
        className="bg-[#1b2539] text-white py-16 border-t border-white/5 scroll-mt-16"
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <MastatineLogo size={80} className="mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-black mb-6">
            About S.A. <span className="text-[#e8b800]">Mastatine</span>
          </h2>

          <div className="space-y-4 text-slate-300 text-sm leading-relaxed max-w-xl mx-auto">
            <p>
              <strong className="text-white">What&apos;s Mastatine?</strong> It&apos;s
              a portmanteau of <em>Mast</em> (Dutch for a transmission tower)
              and <em>Astatine</em>, the Advanced Technology study association
              at the University of Twente.
            </p>
            <p>
              The{" "}
              <a
                href="https://astatine.utwente.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e8b800] hover:underline font-semibold"
              >
                real S.A. Astatine
              </a>{" "}
              logo has the element symbol &ldquo;At&rdquo; at its centre,
              surrounded by 7 valence electrons. We&apos;ve kept the 7
              electrons but replaced &ldquo;At&rdquo; with a transmission tower
              — because <em>Mast</em> + <em>atine</em> = <em>Mastatine</em>.
            </p>
            <p>
              Element 85, same atomic number, just with better antenna
              coverage.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-xs text-slate-500">
            Not affiliated with S.A. Astatine or the University of Twente. No masts were harmed. 📡
          </div>
        </div>
      </section>
    </>
  );
}

// Inline helper — decorative tower silhouette for the hero background
function TowerSilhouette({ cx }: { cx: number }) {
  return (
    <g
      transform={`translate(${cx}, 250)`}
      stroke="white"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <line x1="0" y1="-230" x2="-20" y2="-190" />
      <line x1="0" y1="-230" x2="20" y2="-190" />
      <line x1="-55" y1="-195" x2="55" y2="-195" />
      <line x1="-20" y1="-190" x2="-16" y2="-130" />
      <line x1="20" y1="-190" x2="16" y2="-130" />
      <line x1="-20" y1="-180" x2="20" y2="-140" strokeWidth="1.5" />
      <line x1="20" y1="-180" x2="-20" y2="-140" strokeWidth="1.5" />
      <line x1="-50" y1="-130" x2="50" y2="-130" />
      <line x1="-16" y1="-130" x2="-24" y2="-40" />
      <line x1="16" y1="-130" x2="24" y2="-40" />
      <line x1="-16" y1="-115" x2="22" y2="-60" strokeWidth="1.5" />
      <line x1="16" y1="-115" x2="-22" y2="-60" strokeWidth="1.5" />
      <line x1="-16" y1="-75" x2="22" y2="-42" strokeWidth="1.5" />
      <line x1="16" y1="-75" x2="-22" y2="-42" strokeWidth="1.5" />
      <line x1="-40" y1="-40" x2="40" y2="-40" />
      <line x1="-24" y1="-40" x2="-30" y2="0" />
      <line x1="24" y1="-40" x2="30" y2="0" />
      <line x1="-35" y1="0" x2="35" y2="0" />
    </g>
  );
}
