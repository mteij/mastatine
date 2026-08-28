import Sidebar from "@/components/Sidebar";
import Colophon from "@/components/Colophon";
import { getThisWeekActivities } from "@/lib/calendar";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const activities = await getThisWeekActivities();

  return (
    <div id="site-wrapper">
      <div id="content" className="cryout">
        <div id="container" className="two-columns-left">
          <Sidebar activities={activities} />
          <main id="main" className="main">
            {children}
          </main>
          <div style={{ clear: "both" }} />
        </div>
      </div>
      <Colophon />
    </div>
  );
}
