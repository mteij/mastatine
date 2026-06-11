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
    slug: "mastatine-celebrates-first-lustrum",
    title: "Mastatine celebrates its first lustrum",
    date: "January 20, 2026",
    content: (
      <>
        <p>Dear members,</p>
        <p>
          In the academic year 2025–2026, S.A. Mastatine celebrates its first lustrum with the
          theme: <strong>Electromagnetic</strong>. Each year Mastatine adds a new verse to our
          favourite song. We hope to see you all at the fantastic activities the lustrum committee
          has organised.
        </p>
        <p>To the highest,</p>
        <p>The lustrum committee</p>
      </>
    ),
  },
  {
    id: 2,
    slug: "our-new-vcp",
    title: "Our new VCP",
    date: "October 14, 2025",
    content: (
      <>
        <p>
          We are proud to announce that Mastatine now has a second Confidential Counsellor (VCP),
          Henk de Mastbouwer! He is trained in collegial listening skills and will not share
          anything you tell him in confidence.
        </p>
        <blockquote className="border-l-4 border-[#f57f20] pl-4 my-3 text-[#555] italic text-sm">
          <p>
            Hi everyone! My name is Henk. I am 23 years old and currently in my third year of
            Advanced Mast Technology. In my spare time I love climbing masts and reading everything
            about electromagnetic fields. Do not hesitate to reach out via{" "}
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
    slug: "the-1st-board",
    title: "The 1st Board of S.A. Mastatine!",
    date: "October 14, 2025",
    content: (
      <>
        <p>
          The 1st board of S.A. Mastatine was formally installed on 9 September 2025.
          The board consists of:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Fien Hoogtespanning</strong> — Chair</li>
          <li><strong>Lars Kabelgoot</strong> — Secretary</li>
          <li><strong>Bo Stroomafnemer</strong> — Treasurer</li>
          <li><strong>Mila Isolator</strong> — Commissioner Education &amp; External</li>
          <li><strong>Roel Transformator</strong> — Commissioner Internal</li>
        </ul>
      </>
    ),
  },
  {
    id: 4,
    slug: "first-vcp",
    title: "Our first VCP",
    date: "April 8, 2025",
    content: (
      <>
        <p>
          We are happy to introduce our very first Confidential Counsellor: Wouter van Leijden!
          Wouter is available for any issue, big or small — from study stress to conflicts with
          fellow students.
        </p>
        <p>
          You can reach him at:{" "}
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
                S.A. Mastatine is the study association for students of Advanced Mast Technology
                and Nanotechnology, and co-association of Robotics at the University of Twente.
                We are an international, non-profit association that supports students (and staff)
                of Advanced Mast Technology, Nanotechnology and Robotics in building a community,
                creating personal development opportunities, and evaluating the curriculum. We do
                this through a combination of both educational and extracurricular activities.
              </strong>
            </h5>
            <p className="has-text-align-center text-center">Feel free to look around!</p>
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
                <header className="entry-header">
                  <h2 className="entry-title" itemProp="headline">
                    <a href={`/${post.slug}`} itemProp="mainEntityOfPage" rel="bookmark">
                      {post.title}
                    </a>
                  </h2>
                  <div className="entry-meta">
                    <span className="onDate date">
                      <i className="icon-calendar icon-metas" title="Date" style={{ marginRight: "0.3em", fontSize: "0.85em", color: "#0a0a0a", opacity: 0.6 }}>📅</i>
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
                  Read more &rarr;
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
              <h2 className="section-heading">Mast Gallery</h2>
              {towerCount > 0 && (
                <p className="text-[#555] text-sm mt-1">
                  {towerCount} mast{towerCount !== 1 ? "s" : ""} submitted
                </p>
              )}
            </div>
            <a href="#submit" className="btn-orange text-sm shrink-0">
              + Submit a Mast
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
          <h2 className="section-heading mb-2">Submit a Mast</h2>
          <p className="text-[#555] text-sm mb-6">
            Found an impressive mast? Add it to the Mastatine registry.
          </p>
          <div className="bg-white border border-[#eee] p-6 mb-4 shadow-sm">
            <SubmitForm />
          </div>
          <div className="bg-[#FFF3E8] border border-[#f57f20]/40 rounded p-4">
            <h3 className="font-bold text-[#c05e00] text-sm mb-1">Submission Guidelines</h3>
            <ul className="text-[#c05e00] text-sm space-y-1">
              <li>• Must be a real mast, antenna, or electromagnetic structure</li>
              <li>• Photo must clearly show the mast</li>
              <li>• Add a descriptive or funny title</li>
              <li>• No duplicates — check the gallery first</li>
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
          <h2 className="section-heading mb-4">About S.A. Mastatine</h2>
          <div className="prose text-[#0a0a0a] text-sm leading-relaxed space-y-3">
            <p>
              <strong>What is Mastatine?</strong> It is a portmanteau of{" "}
              <em>Mast</em> (a transmission tower / high-voltage pylon) and <em>Astatine</em>,
              the study association for Advanced Technology at the University of Twente.
            </p>
            <p>
              The logo of the{" "}
              <a href="https://astatine.utwente.nl" target="_blank" rel="noopener noreferrer">
                real S.A. Astatine
              </a>{" "}
              features the element symbol &ldquo;At&rdquo; in the centre, surrounded by 7
              valence electrons. We kept the 7 electrons but replaced &ldquo;At&rdquo; with a
              transmission tower — because{" "}
              <em>Mast</em> + <em>atine</em> = <em>Mastatine</em>.
            </p>
            <p>Element 85, same atomic number, just with better antenna coverage.</p>
            <p className="text-xs text-[#888] pt-2">
              Not affiliated with S.A. Astatine or the University of Twente. No masts were
              harmed. 📡
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
