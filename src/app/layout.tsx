import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lato.className} suppressHydrationWarning>
      <body className="verbosa-landing-page verbosa-magazine-two verbosa-magazine-layout verbosa-no-sidebar-back">
        {children}
      </body>
    </html>
  );
}
