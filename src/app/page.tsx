import sql from "@/lib/db";
import { Tower } from "@/lib/types";
import HeroCarousel from "@/components/HeroCarousel";
import TowerGrid from "@/components/TowerGrid";
import SubmitForm from "@/components/SubmitForm";
import MastatineLogo from "@/components/MastatineLogo";

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
      {/* ── HERO CAROUSEL ── */}
      <section id="home">
        <HeroCarousel />
      </section>

      {/* ── INTRO STRIP ── */}
      <section className="bg-[#f57f20] text-white py-3">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold">
          <span>
            {towerCount > 0
              ? `${towerCount} mast${towerCount !== 1 ? "en" : ""} ingediend — en er komen er meer bij!`
              : "De première studenten-mastvereniging van Nederland!"}
          </span>
          <a href="#submit" className="underline hover:no-underline">
            Dien een mast in &rarr;
          </a>
        </div>
      </section>

      {/* ── WELCOME SECTION ── */}
      <section className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="section-heading">Welkom bij S.A. Mastatine</h2>
              <p className="text-[#555] mb-4 leading-relaxed">
                S.A. Mastatine is de studievereniging voor studenten
                Gevorderde Masttechnologie aan de Universiteit van Twente.
                Wij staan voor de documentatie, appreciatie en ranking van
                hoogspanningsmasten, communicatiemasten en alle
                elektromagnetische constructies.
              </p>
              <p className="text-[#555] mb-6 leading-relaxed">
                Heb jij een spectaculaire mast gevonden? Dien hem in en laat
                de community stemmen!
              </p>
              <div className="flex gap-3 flex-wrap">
                <a href="#towers" className="btn-orange">Mastengalerij</a>
                <a href="#about" className="inline-block border-2 border-[#f57f20] text-[#f57f20] font-bold px-6 py-2 rounded hover:bg-[#f57f20] hover:text-white transition-colors">
                  Over ons
                </a>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <MastatineLogo size={220} />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-[#888] whitespace-nowrap">
                  Element 85 — Mastatine
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE TILES ── */}
      <section className="bg-[#f7f7f7] border-t border-[#e0e0e0] py-14">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="section-heading mb-8">Wat is S.A. Mastatine?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: "📡",
                title: "Ontdek masten",
                body: "Blader door de groeiende collectie van ingediende masten uit heel Nederland en daarbuiten.",
              },
              {
                icon: "⬆️",
                title: "Stem op de beste",
                body: "Geef je stem aan de mooiste, raarste of indrukwekkendste toren in de galerij.",
              },
              {
                icon: "📸",
                title: "Dien een mast in",
                body: "Upload een foto van jouw favoriete mast en voeg hem toe aan het officiële register.",
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                className="bg-white rounded border border-[#e0e0e0] p-6 hover:border-[#f57f20] transition-colors group"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-bold text-[#2d2d2d] mb-2 group-hover:text-[#f57f20] transition-colors">
                  {title}
                </h3>
                <p className="text-[#555] text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOWER GALLERY ── */}
      <section id="towers" className="bg-white py-14 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
            <div>
              <h2 className="section-heading">Mastengalerij</h2>
              <p className="text-[#555] text-sm mt-1">
                Browse, stem en vier de mooiste masten ingediend door onze gemeenschap.
              </p>
            </div>
            <a href="#submit" className="btn-orange text-sm shrink-0">
              + Mast indienen
            </a>
          </div>
          <TowerGrid initialTowers={towers} votedTowerIds={[]} />
        </div>
      </section>

      {/* ── SUBMIT ── */}
      <section
        id="submit"
        className="bg-[#f7f7f7] border-t border-[#e0e0e0] py-14 scroll-mt-16"
      >
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="section-heading mb-2">Mast indienen</h2>
          <p className="text-[#555] text-sm mb-6">
            Een indrukwekkende mast gevonden? Voeg hem toe aan het Mastatine-register.
          </p>

          <div className="bg-white rounded border border-[#e0e0e0] p-6 mb-5 shadow-sm">
            <SubmitForm />
          </div>

          <div className="bg-[#FFF3E8] border border-[#f57f20]/40 rounded p-4">
            <h3 className="font-bold text-[#c05e00] text-sm mb-1">
              Inzendingsrichtlijnen
            </h3>
            <ul className="text-[#c05e00] text-sm space-y-1">
              <li>• Moet een echte mast, antenne of elektromagnetische constructie zijn</li>
              <li>• Foto moet de mast duidelijk tonen</li>
              <li>• Voeg een beschrijvende of grappige titel toe</li>
              <li>• Geen duplicaten — controleer de galerij eerst</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section
        id="about"
        className="bg-[#1a2332] text-white py-16 scroll-mt-16"
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl font-black mb-4" style={{ color: "#f57f20" }}>
                Over S.A. Mastatine
              </h2>
              <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                <p>
                  <strong className="text-white">Wat is Mastatine?</strong>{" "}
                  Het is een samentrekking van <em>Mast</em> (een
                  zendmast/hoogspanningsmast) en <em>Astatine</em>, de
                  studievereniging voor Advanced Technology aan de
                  Universiteit Twente.
                </p>
                <p>
                  Het logo van de{" "}
                  <a
                    href="https://astatine.utwente.nl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#f57f20] hover:underline font-semibold"
                  >
                    echte S.A. Astatine
                  </a>{" "}
                  heeft het elementsymbool &ldquo;At&rdquo; in het midden,
                  omgeven door 7 valentie-elektronen. Wij hebben de 7
                  elektronen behouden maar &ldquo;At&rdquo; vervangen door
                  een zendmast — want <em>Mast</em> + <em>atine</em> ={" "}
                  <em>Mastatine</em>.
                </p>
                <p>Element 85, hetzelfde atoomnummer, alleen met betere antennedekking.</p>
              </div>
            </div>
            <div className="bg-white/5 rounded border border-white/10 p-6">
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                Snelle feiten
              </h3>
              <dl className="space-y-3 text-sm">
                {[
                  ["Atoomnummer", "85"],
                  ["Symbool", "Mt (Mastatine)"],
                  ["Categorie", "Elektromagnetische halogeen"],
                  ["Ontdekt", "2025, Enschede"],
                  ["Bijzonderheid", "Uitstekende antennedekking"],
                ].map(([term, def]) => (
                  <div key={term} className="flex justify-between gap-4">
                    <dt className="text-slate-400">{term}</dt>
                    <dd className="text-white font-semibold text-right">{def}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/10 text-xs text-slate-500 text-center">
            Niet gelieerd aan S.A. Astatine of de Universiteit Twente. Geen masten zijn beschadigd. 📡
          </div>
        </div>
      </section>
    </>
  );
}
