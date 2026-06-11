import Link from "next/link";
import { createServiceClient } from "@/lib/supabase";
import { Tower } from "@/lib/types";

async function getTopTowers(): Promise<Tower[]> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("towers")
      .select("*")
      .order("vote_count", { ascending: false })
      .limit(3);
    return data ?? [];
  } catch {
    return [];
  }
}

async function getTowerCount(): Promise<number> {
  try {
    const supabase = createServiceClient();
    const { count } = await supabase
      .from("towers")
      .select("*", { count: "exact", head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function HomePage() {
  const [topTowers, towerCount] = await Promise.all([
    getTopTowers(),
    getTowerCount(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-[#1a2332] text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 40px,
              rgba(255,212,0,0.3) 40px,
              rgba(255,212,0,0.3) 41px
            ), repeating-linear-gradient(
              90deg,
              transparent,
              transparent 40px,
              rgba(255,212,0,0.3) 40px,
              rgba(255,212,0,0.3) 41px
            )`,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="text-7xl mb-4">📡</div>
          <h1 className="text-5xl font-black tracking-tight mb-4">
            S.A. <span className="text-yellow-400">Mastatine</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-2">
            <em>Studievereniging voor Gevorderde Masttechnologie</em>
          </p>
          <p className="text-slate-400 max-w-xl mx-auto mb-10 text-sm">
            The world&apos;s foremost academic association for the appreciation,
            documentation, and celebration of transmission towers, communication
            masts, and all electromagnetic structures.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/towers"
              className="bg-yellow-400 text-[#1a2332] font-bold px-8 py-3 rounded-lg hover:bg-yellow-300 transition-colors"
            >
              Browse Masts
            </Link>
            <Link
              href="/submit"
              className="border-2 border-white/30 text-white font-bold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              Submit a Mast
            </Link>
          </div>

          {towerCount > 0 && (
            <p className="mt-8 text-slate-400 text-sm">
              {towerCount} mast{towerCount !== 1 ? "s" : ""} submitted so far
            </p>
          )}
        </div>
      </section>

      {/* Striped warning banner */}
      <div
        className="h-3"
        style={{
          background:
            "repeating-linear-gradient(45deg, #FFD700 0, #FFD700 10px, #1a2332 10px, #1a2332 20px)",
        }}
      />

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: "📡",
              label: "Masts submitted",
              value: towerCount.toString(),
            },
            { icon: "⚡", label: "Member since", value: "2026" },
            { icon: "🏆", label: "Official body", value: "None" },
          ].map(({ icon, label, value }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-6 text-center shadow-sm border border-slate-200"
            >
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-2xl font-black text-[#1a2332]">{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Top 3 */}
        {topTowers.length > 0 && (
          <div>
            <h2 className="text-2xl font-black text-[#1a2332] mb-6 flex items-center gap-2">
              🏆 <span>Top Masts</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {topTowers.map((tower, i) => (
                <div
                  key={tower.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200"
                >
                  <div className="relative h-40 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tower.image_url}
                      alt={tower.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-yellow-400 text-[#1a2332] w-7 h-7 rounded-full flex items-center justify-center font-black text-sm shadow">
                      {i + 1}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">
                      {tower.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400">
                        {tower.submitter_name}
                      </span>
                      <span className="text-xs font-bold text-yellow-600">
                        ▲ {tower.vote_count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link
                href="/towers"
                className="inline-block bg-[#1a2332] text-white font-bold px-6 py-2.5 rounded-lg hover:bg-yellow-400 hover:text-[#1a2332] transition-colors"
              >
                See all masts →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* About strip */}
      <section className="bg-[#1a2332] text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-4">
            About S.A. <span className="text-yellow-400">Mastatine</span>
          </h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Inspired by the excellent work of{" "}
            <a
              href="https://astatine.utwente.nl"
              className="text-yellow-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              S.A. Astatine
            </a>{" "}
            — the Advanced Technology study association at the University of
            Twente — we took the{" "}
            <em>&ldquo;At&rdquo;</em> in Astatine and replaced it with{" "}
            <em>&ldquo;Mast&rdquo;</em>. Because every good element deserves a
            transmission tower.
          </p>
          <p className="text-slate-400 text-sm">
            This is a joke website. No masts were harmed in the making of this
            page. 📡
          </p>
        </div>
      </section>
    </>
  );
}
