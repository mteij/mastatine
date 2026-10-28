import Link from "next/link";
import { NEWS } from "@/content/site";

/** Site-wide strip at the very top showing the latest news post, so a new post is announced everywhere automatically. */
export default function AnnouncementBar() {
  const latest = NEWS[0];
  if (!latest) return null;

  return (
    <aside className="announce" aria-label="Latest news">
      <Link href={`/news/${latest.slug}`} className="announce__link">
        <span className="announce__tag">New</span>
        <span className="announce__title">{latest.title}</span>
        <span className="announce__summary">{latest.summary}</span>
        <span className="announce__more" aria-hidden>Read more &rarr;</span>
      </Link>
    </aside>
  );
}
