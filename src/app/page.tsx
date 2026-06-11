import sql from "@/lib/db";
import { Tower } from "@/lib/types";
import HeroCarousel from "@/components/HeroCarousel";
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

const NEWS = [
  {
    id: 1,
    slug: "mastatine-viert-eerste-lustrum",
    title: "Mastatine viert haar eerste lustrum",
    date: "20 januari 2026",
    content: (
      <>
        <p>Beste leden,</p>
        <p>
          Het academisch jaar 2025–2026 viert S.A. Mastatine haar eerste lustrum met het thema:{" "}
          <strong>Elektromagnetisch</strong>. Elk jaar voegt Mastatine een nieuw couplet toe aan
          ons favoriete lied. We hopen jullie allemaal te zien bij de fantastische activiteiten die
          de lustrumcommissie heeft georganiseerd.
        </p>
        <p>Op de hoogste,</p>
        <p>De lustrumcommissie</p>
      </>
    ),
  },
  {
    id: 2,
    slug: "onze-nieuwe-vcp",
    title: "Onze nieuwe VCP",
    date: "14 oktober 2025",
    content: (
      <>
        <p>
          We zijn er trots op te mogen aankondigen dat Mastatine nu een tweede{" "}
          Vertrouwenscontactpersoon (VCP) heeft, Henk de Mastbouwer! Hij is getraind in
          collegiale luistervaardigheden en deelt niets wat je hem in vertrouwen vertelt.
        </p>
        <blockquote className="border-l-4 border-[#f57f20] pl-4 my-3 text-[#555] italic text-sm">
          <p>
            Hoi iedereen! Mijn naam is Henk. Ik ben 23 jaar oud en zit momenteel in mijn derde
            jaar Gevorderde Masttechnologie. In mijn vrije tijd beklim ik graag masten en lees ik
            alles over elektromagnetische velden. Aarzel niet om contact met mij op te nemen via{" "}
            <a href="mailto:h.demastbouwer@student.utwente.nl">
              h.demastbouwer@student.utwente.nl
            </a>
          </p>
        </blockquote>
      </>
    ),
  },
  {
    id: 3,
    slug: "het-1e-bestuur",
    title: "Het 1e Bestuur van S.A. Mastatine!",
    date: "14 oktober 2025",
    content: (
      <>
        <p>
          Het 1e bestuur van S.A. Mastatine werd formeel geïnstalleerd op 9 september 2025.
          Het bestuur bestaat uit:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Fien Hoogtespanning</strong> — Voorzitter</li>
          <li><strong>Lars Kabelgoot</strong> — Secretaris</li>
          <li><strong>Bo Stroomafnemer</strong> — Penningmeester</li>
          <li><strong>Mila Isolator</strong> — Commissaris Onderwijs & Extern</li>
          <li><strong>Roel Transformator</strong> — Commissaris Intern</li>
        </ul>
      </>
    ),
  },
  {
    id: 4,
    slug: "eerste-vcp",
    title: "Onze eerste VCP",
    date: "8 april 2025",
    content: (
      <>
        <p>
          We zijn blij onze allereerste Vertrouwenscontactpersoon voor te stellen: Wouter van
          Leijden! Wouter staat voor je klaar voor allerlei kwesties, groot of klein — van
          studiestress tot conflicten met medestudenten.
        </p>
        <p>
          Je kunt hem bereiken via:{" "}
          <a href="mailto:w.vanleijden@student.utwente.nl">
            w.vanleijden@student.utwente.nl
          </a>
        </p>
      </>
    ),
  },
];

export default async function HomePage() {
  const [towers, towerCount] = await Promise.all([getTowers(), getTowerCount()]);

  return (
    <>
      {/* ── lp-text: intro paragraph ── */}
      <section className="lp-text" id="lp-text-one">
        <div className="lp-text-inside">
          <h2 className="lp-text-title">Home</h2>
          <div className="lp-text-content">
            <h5 className="wp-block-heading has-text-align-center">
              <strong>
                S.A. Mastatine is de studievereniging voor studenten Gevorderde Masttechnologie
                en Nanotechnologie, en co-vereniging van Robotica aan de Universiteit Twente.
                Wij zijn een internationale, non-profit vereniging die studenten (en staf) van
                Gevorderde Masttechnologie, Nanotechnologie en Robotica ondersteunt bij het
                opbouwen van een community, het creëren van persoonlijke
                ontwikkelingsmogelijkheden, en het evalueren van het curriculum. Dit doen wij
                door middel van een combinatie van zowel educatieve als extracurriculaire
                activiteiten.
              </strong>
            </h5>
            <p className="has-text-align-center text-center">Kijk gerust rond!</p>
          </div>
        </div>
      </section>

      {/* ── lp-slider: image carousel ── */}
      <section className="lp-slider-overlay" id="home">
        <div className="lp-dynamic-slider">
          <HeroCarousel />
        </div>
      </section>

      {/* ── lp-posts: news masonry ── */}
      <section id="lp-posts">
        <div className="lp-posts-inside">
          <div id="content-masonry" className="content-masonry" itemScope itemType="http://schema.org/Blog">
            {NEWS.map((post) => (
              <article
                key={post.id}
                className="post hentry"
                itemScope
                itemType="http://schema.org/BlogPosting"
                itemProp="blogPost"
              >
                <div className="featured-bar" />
                <header className="entry-header">
                  <h2 className="entry-title" itemProp="headline">
                    <a href={`/${post.slug}`} itemProp="mainEntityOfPage" rel="bookmark">
                      {post.title}
                    </a>
                  </h2>
                  <div className="entry-meta">
                    <span className="onDate date">
                      <time className="published" itemProp="datePublished">
                        {post.date}
                      </time>
                    </span>
                  </div>
                </header>
                <div className="entry-content" itemProp="articleBody">
                  {post.content}
                </div>
                <a href={`/${post.slug}`} className="continue-reading-link">
                  Lees verder &rarr;
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tower gallery ── */}
      <section
        id="towers"
        className="bg-white py-10 scroll-mt-4"
        style={{ marginTop: 2 }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="section-heading">Mastengalerij</h2>
              {towerCount > 0 && (
                <p className="text-[#555] text-sm mt-1">
                  {towerCount} mast{towerCount !== 1 ? "en" : ""} ingediend
                </p>
              )}
            </div>
            <a href="#submit" className="btn-orange text-sm shrink-0">
              + Mast indienen
            </a>
          </div>
          <TowerGrid initialTowers={towers} votedTowerIds={[]} />
        </div>
      </section>

      {/* ── Submit form ── */}
      <section
        id="submit"
        className="bg-[#f5f5f5] border-t border-[#eee] py-10 scroll-mt-4"
        style={{ marginTop: 2 }}
      >
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="section-heading mb-2">Mast indienen</h2>
          <p className="text-[#555] text-sm mb-6">
            Een indrukwekkende mast gevonden? Voeg hem toe aan het Mastatine-register.
          </p>
          <div className="bg-white border border-[#eee] p-6 mb-4 shadow-sm">
            <SubmitForm />
          </div>
          <div className="bg-[#FFF3E8] border border-[#f57f20]/40 rounded p-4">
            <h3 className="font-bold text-[#c05e00] text-sm mb-1">Inzendingsrichtlijnen</h3>
            <ul className="text-[#c05e00] text-sm space-y-1">
              <li>• Moet een echte mast, antenne of elektromagnetische constructie zijn</li>
              <li>• Foto moet de mast duidelijk tonen</li>
              <li>• Voeg een beschrijvende of grappige titel toe</li>
              <li>• Geen duplicaten — controleer de galerij eerst</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section
        id="about"
        className="bg-white border-t border-[#eee] py-10 scroll-mt-4"
        style={{ marginTop: 2 }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="section-heading mb-4">Over S.A. Mastatine</h2>
          <div className="prose text-[#0a0a0a] text-sm leading-relaxed space-y-3">
            <p>
              <strong>Wat is Mastatine?</strong> Het is een samentrekking van{" "}
              <em>Mast</em> (een zendmast/hoogspanningsmast) en <em>Astatine</em>, de
              studievereniging voor Advanced Technology aan de Universiteit Twente.
            </p>
            <p>
              Het logo van de{" "}
              <a href="https://astatine.utwente.nl" target="_blank" rel="noopener noreferrer">
                echte S.A. Astatine
              </a>{" "}
              heeft het elementsymbool &ldquo;At&rdquo; in het midden, omgeven door 7
              valentie-elektronen. Wij hebben de 7 elektronen behouden maar &ldquo;At&rdquo;
              vervangen door een zendmast — want{" "}
              <em>Mast</em> + <em>atine</em> = <em>Mastatine</em>.
            </p>
            <p>Element 85, hetzelfde atoomnummer, alleen met betere antennedekking.</p>
            <p className="text-xs text-[#888] pt-2">
              Niet gelieerd aan S.A. Astatine of de Universiteit Twente. Geen masten zijn
              beschadigd. 📡
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
