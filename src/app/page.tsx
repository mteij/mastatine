import Link from "next/link";
import sql from "@/lib/db";
import { MastSlide } from "@/lib/types";
import { describeDbError } from "@/lib/db";
import { PAGE_SIZE, listTowers, parseQuery, type TowerPage } from "@/lib/towers";
import HeroCarousel from "@/classic/HeroCarousel";
import TowerGrid from "@/classic/TowerGrid";
import SubmitModal from "@/classic/SubmitModal";
import { NEWS, formatDate } from "@/content/site";
import MinecraftBar from "@/components/MinecraftBar";
import UpcomingActivities from "@/components/UpcomingActivities";

async function getFirstPage(q: string): Promise<TowerPage> {
  try {
    return await listTowers({ sort: "rating", q, offset: 0, limit: PAGE_SIZE });
  } catch (error) {
    console.error(`Failed to load towers: ${describeDbError(error)}`);
    return { towers: [], hasMore: false };
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
  } catch (error) {
    console.error(`Failed to load mast of the month: ${describeDbError(error)}`);
    return [];
  }
}

// Rendered per request: the database is local, and the build has no DB to prerender from.
export const dynamic = "force-dynamic";

export default async function HomePage(
  props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }
) {
  const q = parseQuery((await props.searchParams)?.s);
  const latest = NEWS[0];
  const [firstPage, mastsOfMonth] = await Promise.all([
    getFirstPage(q),
    getMastsOfMonth(),
  ]);

  return (
    <>
      <UpcomingActivities />

      {/* ── lp-text: intro paragraph ── */}
      <section className="lp-text" id="lp-text-one">
        <div className="lp-text-inside">
          <h2 className="lp-text-title">Home</h2>
          <div className="lp-text-content">
            <h5 className="wp-block-heading has-text-align-center">
              <strong>
                S.A. Mastatine is the study association for students of Advanced Mastology
                and Nanomastology, and co-association of Mastotics at the University of Maste.
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
          <HeroCarousel masts={mastsOfMonth} overlay={<MinecraftBar />} />
        </div>
      </section>

      {/* ── lp-posts: news & tower grid merged ── */}
      <div id="towers" style={{ scrollMarginTop: "2rem" }} />
      <section id="lp-posts">
        <div className="lp-posts-inside">
          <TowerGrid initialPage={firstPage} initialQuery={q}>
            <article
              className="post hentry news-card"
              itemScope
              itemType="http://schema.org/BlogPosting"
              itemProp="blogPost"
            >
              <div className="news-card__top">
                <span className="news-card__label">Latest news</span>
                <Link href="/news" className="news-card__all">
                  All news
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </div>
              <header className="entry-header" style={{ marginBottom: "0.4em" }}>
                <h2 className="entry-title" itemProp="headline" style={{ fontSize: "1.15rem", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "0.2em" }}>
                  <Link href={`/news/${latest.slug}`} itemProp="mainEntityOfPage" rel="bookmark" style={{ color: "var(--navy)" }}>
                    {latest.title}
                  </Link>
                </h2>
                <div className="entry-meta">
                  <span className="onDate date">
                    <time className="published" itemProp="datePublished" dateTime={latest.date}>
                      {formatDate(latest.date)}
                    </time>
                  </span>
                </div>
              </header>
              <div
                className="entry-content"
                itemProp="articleBody"
                style={{
                  flex: 1,
                  minHeight: 0,
                  fontSize: "1rem",
                  lineHeight: 1.55,
                  marginBottom: "0.5rem",
                }}
              >
                {latest.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
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
