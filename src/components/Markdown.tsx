import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";

// Mirrors the server's upload naming; kept here so this file stays free of Node-only imports (it also runs in the editor preview).
const UPLOADED_IMAGE = /^\/uploads\/[a-z0-9-]+\.(jpg|png|webp|gif)$/;
const SAFE_LINK = /^(https?:|mailto:|\/(?!\/))/i;

/** Only our own uploads may be shown as images, and links must be http(s), mailto or on-site. Anything else renders as nothing. */
function safeUrl(url: string, key: string): string {
  if (key === "src") return UPLOADED_IMAGE.test(url) ? url : "";
  return SAFE_LINK.test(url) ? url : "";
}

// Notes sit under an agenda item heading, so "#" headings are drawn as sub-headings rather than page titles.
const components: Components = {
  h1: ({ children }) => <h4 className="mb-1 mt-3 text-base font-extrabold">{children}</h4>,
  h2: ({ children }) => <h5 className="mb-1 mt-3 text-[0.95rem] font-extrabold">{children}</h5>,
  h3: ({ children }) => <h6 className="mb-1 mt-2 text-sm font-extrabold uppercase tracking-wide text-muted">{children}</h6>,
  h4: ({ children }) => <h6 className="mb-1 mt-2 text-sm font-extrabold">{children}</h6>,
  h5: ({ children }) => <h6 className="mb-1 mt-2 text-sm font-bold">{children}</h6>,
  h6: ({ children }) => <h6 className="mb-1 mt-2 text-sm font-bold">{children}</h6>,
  p: ({ children }) => <p className="my-1.5">{children}</p>,
  ul: ({ children }) => <ul className="my-1.5 list-disc space-y-0.5 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-1.5 list-decimal space-y-0.5 pl-5">{children}</ol>,
  blockquote: ({ children }) => <blockquote className="my-2 border-l-4 border-line pl-3 text-muted">{children}</blockquote>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-text underline underline-offset-2">{children}</a>
  ),
  img: ({ src, alt }) =>
    typeof src === "string" && src ? (
      // Uploads are already resized WebP, so next/image would add nothing.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt ?? ""} loading="lazy" className="my-2 max-h-96 max-w-full rounded-lg border border-line" />
    ) : null,
  hr: () => <hr className="my-3 border-line" />,
};

/** Minutes text: a safe subset of Markdown (no raw HTML), with single line breaks kept like the old plain-text notes. */
export default function Markdown({ children, className = "" }: { children: string; className?: string }) {
  return (
    <div className={`break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkBreaks]} components={components} urlTransform={safeUrl}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
