import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "S.A. Mastatine — De studievereniging voor open-minded ingenieurs",
  description:
    "S.A. Mastatine is de studievereniging voor Gevorderde Masttechnologie. Dien je favoriete mast in en stem op de mooiste elektromagnetische constructies van Nederland.",
  openGraph: {
    title: "S.A. Mastatine",
    description: "Dien een mast in en stem op de mooiste zendmasten.",
    url: "https://mastatine.nl",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={lato.className}>
      <body className="verbosa-landing-page verbosa-magazine-two verbosa-magazine-layout verbosa-no-sidebar-back">
        <div id="site-wrapper">
          <div id="content" className="cryout" style={{ maxWidth: 1460, margin: "0 auto", display: "flex", alignItems: "flex-start" }}>
            <Sidebar />
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
