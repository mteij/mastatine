import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { getThisWeekActivities } from "@/lib/calendar";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "S.A. Mastatine — The study association for open-minded engineers",
  description:
    "S.A. Mastatine is the study association for Advanced Mast Technology. Submit your favourite mast and vote on the most impressive electromagnetic structures in the Netherlands.",
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
          <div id="content" className="cryout" style={{ maxWidth: 1460, margin: "0 auto", display: "flex", alignItems: "flex-start" }}>
            <Sidebar activities={activities} />
            <main id="main" className="main" style={{ flex: 1, minWidth: 0, marginTop: 15 }}>
              {children}
            </main>
          </div>
          <div style={{ clear: "both" }} />
        </div>
      </body>
    </html>
  );
}
