import sql from "@/lib/db";
import { Tower } from "@/lib/types";
import HeroCarousel from "@/components/HeroCarousel";
import TowerGrid from "@/components/TowerGrid";
import SubmitModal from "@/components/SubmitModal";

export interface MastSlide {
  id: string;
  title: string;
  image_url: string;
  submitter_name: string;
  vote_count: number;
  monthly_votes: number;
}

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
        COUNT(v.id)::int AS monthly_votes
      FROM towers t
      LEFT JOIN votes v
        ON v.tower_id = t.id
        AND DATE_TRUNC('month', v.created_at) = DATE_TRUNC('month', NOW())
      GROUP BY t.id
      ORDER BY monthly_votes DESC, t.vote_count DESC
      LIMIT 3
    `;
  } catch {
    return [];
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
            {NEWS.map((post) => (
              <article
                key={post.id}
                className="post hentry"
                itemScope
                itemType="http://schema.org/BlogPosting"
                itemProp="blogPost"
              >
                <header className="entry-header">
                  <h2 className="entry-title" itemProp="headline" style={{ fontSize: "1.15rem", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    <a href={`/${post.slug}`} itemProp="mainEntityOfPage" rel="bookmark" style={{ color: "var(--navy)" }}>
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
                <SubmitModal />
              </article>
            ))}
          </TowerGrid>
        </div>
      </section>

</>
  );
}
