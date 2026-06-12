import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Colophon from "@/components/Colophon";
import { getThisWeekActivities } from "@/lib/calendar";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "S.A. Mastatine — The study association for mastende engineers",
  description:
    "S.A. Mastatine is the study association for Advanced Mast Technology. Submit your favourite mast and vote on the most impressive electromagnetic structures in the Netherlands.",
  icons: { icon: "/favicon.svg?v=2" },
  openGraph: {
    title: "S.A. Mastatine",
    description: "Submit a mast and vote on the finest transmission towers.",
    url: "https://mastatine.nl",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const activities = await getThisWeekActivities();

  return (
    <html lang="en" className={lato.className} suppressHydrationWarning>
      <body className="verbosa-landing-page verbosa-magazine-two verbosa-magazine-layout verbosa-no-sidebar-back">
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
      </body>
    </html>
  );
}
