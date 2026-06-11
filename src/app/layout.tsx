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
      <body className="bg-[#f57f20] antialiased">
        <div id="site-wrapper">
          <div id="content" className="cryout flex max-w-[1460px] mx-auto items-start">
            <Sidebar />
            <div id="sidebar-back" className="hidden lg:block" />
            <main id="main" className="main flex-1 min-w-0 mt-[15px]">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
