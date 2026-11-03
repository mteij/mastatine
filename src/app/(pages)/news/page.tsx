import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { formatDate, getNews } from "@/lib/news";

export const metadata: Metadata = {
  title: "News",
  description: "News and announcements from S.A. Mastatine.",
};

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news = await getNews();
  return (
    <>
      <PageHeader title="Announcements" intro="What the board has been up to, reported with appropriate gravity." />
      <div className="container-prose">
        <ul className="divide-y-2 divide-[#b8bcc4] border-y-2 border-[#b8bcc4]">
          {news.map((post) => (
            <li key={post.slug}>
              <Link href={`/news/${post.slug}`} className="group block py-7">
                <time dateTime={post.date} className="text-sm text-muted">
                  {formatDate(post.date)}
                </time>
                <h2 className="mt-1 text-xl font-bold group-hover:text-accent-text">{post.title}</h2>
                <p className="mt-2 text-muted">{post.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
        {news.length === 0 && <p className="py-10 text-center text-muted">No news yet.</p>}
      </div>
    </>
  );
}
