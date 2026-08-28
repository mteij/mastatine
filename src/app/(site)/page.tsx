import sql from "@/lib/db";
import { Tower, MastSlide } from "@/lib/types";
import HeroCarousel from "@/components/HeroCarousel";
import TowerGrid from "@/components/TowerGrid";
import SubmitModal from "@/components/SubmitModal";

async function getTowers(search?: string): Promise<Tower[]> {
  try {
    if (search) {
      const searchPattern = `%${search}%`;
      return await sql<Tower[]>`
        SELECT * FROM towers 
        WHERE title ILIKE ${searchPattern} 
           OR description ILIKE ${searchPattern}
           OR submitter_name ILIKE ${searchPattern}
        ORDER BY vote_count DESC
      `;
    }
    return await sql<Tower[]>`SELECT * FROM towers ORDER BY vote_count DESC`;
  } catch (error) {
    console.error('Failed to get towers:', error);
    return [];
  }
}


async function getMastsOfMonth(): Promise<MastSlide[]> {
  try {
    return await sql<MastSlide[]>`
      SELECT
        t.id, t.title, t.image_url, t.submitter_name, t.vote_count,
        t.description, t.height, t.created_at,
        COALESCE(
          SUM(CASE WHEN v.direction = 'up' THEN 1 WHEN v.direction = 'down' THEN -1 ELSE 0 END),
          0
        )::int AS monthly_votes
      FROM towers t
      LEFT JOIN votes v
        ON v.tower_id = t.id
        AND DATE_TRUNC('month', v.created_at) = DATE_TRUNC('month', NOW())
      GROUP BY t.id
      ORDER BY monthly_votes DESC, t.vote_count DESC
      LIMIT 1
    `;
  } catch {
    return [];
  }
}

export const revalidate = 30;

const NEWS = [
  {
    id: 2,
    slug: "we-are-sooooo-back",
    title: "We are sooooo back!",
    date: "August 28, 2026",
    content: (
      <>
        <p>We are sooooo BACK.</p>
        <p>
          After a well-deserved summer, S.A. Mastatine is back in full force. New masts, new
          votes, new Mast of the Month glory — the towers are climbing again and we could not be
          more hyped for the new academic year.
        </p>
        <p>Get your entries in and rally your housemates. Let&apos;s make this the best masting season yet.</p>
        <p>Op de hoge masten,</p>
        <p>The board</p>
      </>
    ),
  },
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
          theme: <strong>Masten</strong>. We hope to see you all at the fantastic activities the lustrum committee
          has organised.
        </p>
        <p>Op de hoge masten,</p>
        <p>The lustrum committee</p>
      </>
    ),
  },
];

export default async function HomePage(
  props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const s = typeof searchParams?.s === 'string' ? searchParams.s : undefined;

  const [towers, mastsOfMonth] = await Promise.all([
    getTowers(s),
    getMastsOfMonth(),
  ]);

  return (
    <>
      {/* ── lp-text: intro paragraph ── */}
      <section className="lp-text" id="lp-text-one">
        <div className="lp-text-inside">
          <h2 className="lp-text-title">Home</h2>
          <div className="lp-text-content">
            <h5 className="wp-block-heading has-text-align-center">
              <strong>
                S.A. Mastatine is the study association for students of Advanced Mastology
                and Nanomastology, and co-association of Mastotics at the University of Twente.
                We are an international, non-profit association that supports students (and staff)
                of Advanced Mastology, Nanomastology and Mastotics in building a community,
                creating personal development opportunities, and evaluating the curriculum. We do
                this through masting.
              </strong>
            </h5>
            <p className="has-text-align-center text-center">Feel free to mast around!</p>
          </div>
        </div>
      </section>

      {/* ── lp-slider: image carousel ── */}
      <section className="lp-slider-overlay" id="home">
        <div className="lp-dynamic-slider">
          <HeroCarousel masts={mastsOfMonth} />
        </div>
      </section>

      {/* ── lp-posts: news & tower grid merged ── */}
      <div id="towers" style={{ scrollMarginTop: "2rem" }} />
      <section id="lp-posts">
        <div className="lp-posts-inside">
          <TowerGrid initialTowers={towers}>
            <article
              className="post hentry"
              itemScope
              itemType="http://schema.org/BlogPosting"
              itemProp="blogPost"
            >
              <header className="entry-header" style={{ marginBottom: "0.4em" }}>
                <h2 className="entry-title" itemProp="headline" style={{ fontSize: "1.15rem", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "0.2em" }}>
                  <a href={`/${NEWS[0].slug}`} itemProp="mainEntityOfPage" rel="bookmark" style={{ color: "var(--navy)" }}>
                    {NEWS[0].title}
                  </a>
                </h2>
                <div className="entry-meta">
                  <span className="onDate date">
                    <time className="published" itemProp="datePublished">
                      {NEWS[0].date}
                    </time>
                  </span>
                </div>
              </header>
              <div
                className="entry-content news-scroll"
                itemProp="articleBody"
                style={{
                  overflowY: "auto",
                  flex: 1,
                  minHeight: 0,
                  fontSize: "0.9rem",
                  lineHeight: 1.55,
                  marginBottom: "0.5rem",
                }}
              >
                {NEWS.map((post, index) => (
                  <div
                    key={post.id}
                    style={
                      index > 0
                        ? { marginTop: "1em", paddingTop: "1em", borderTop: "1px solid rgba(0,0,0,0.08)" }
                        : undefined
                    }
                  >
                    {index > 0 && (
                      <div style={{ marginBottom: "0.3em" }}>
                        <strong style={{ color: "var(--navy)" }}>{post.title}</strong>
                        <div className="onDate date" style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                          {post.date}
                        </div>
                      </div>
                    )}
                    {post.content}
                  </div>
                ))}
              </div>
              <SubmitModal />
            </article>
          </TowerGrid>
        </div>
      </section>

</>
  );
}
