import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { NEWS, formatDate } from "@/content/site";

export const metadata: Metadata = {
  title: "News",
  description: "News and announcements from S.A. Mastatine.",
};

export default function NewsPage() {
  return (
    <>
      <PageHeader title="Announcements" intro="What the board has been up to, reported with appropriate gravity." />
      <div className="container-prose">
        <ul className="divide-y divide-line border-y border-line">
          {NEWS.map((post) => (
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
      </div>
    </>
  );
}
