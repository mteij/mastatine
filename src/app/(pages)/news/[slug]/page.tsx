import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NEWS, findNews, formatDate } from "@/content/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return NEWS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = findNews((await params).slug);
  return post ? { title: post.title, description: post.summary } : {};
}

export default async function NewsPostPage({ params }: Props) {
  const post = findNews((await params).slug);
  if (!post) notFound();

  return (
    <article className="container-prose py-14 sm:py-20">
      <Link href="/news" className="text-sm font-medium text-accent-text hover:underline">
        &larr; All news
      </Link>
      <time dateTime={post.date} className="mt-6 block text-sm text-muted">
        {formatDate(post.date)}
      </time>
      <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">{post.title}</h1>
      <div className="prose-lite mt-8">
        {post.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
