/** Every page except the homepage sits in a white panel on the orange background, like the homepage intro box. */
export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return <div className="page-panel">{children}</div>;
}
