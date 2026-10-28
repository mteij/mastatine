import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import Sidebar from "@/classic/Sidebar";
import Colophon from "@/classic/Colophon";
import AppShell from "@/classic/AppShell";
import { siteUrl } from "@/lib/env";
import { getShopUrl } from "@/lib/shop";

// Rendered per request so runtime settings (the shop link) take effect without a rebuild.
export const dynamic = "force-dynamic";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "S.A. Mastatine — The study association for mastende engineers",
    template: "%s · S.A. Mastatine",
  },
  description:
    "S.A. Mastatine is the study association for Advanced Mast Technology. Submit your favourite mast and vote on the most impressive electromagnetic structures in the Netherlands.",
  applicationName: "S.A. Mastatine",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "S.A. Mastatine",
    description: "Submit a mast and vote on the finest transmission towers.",
    url: siteUrl(),
    siteName: "S.A. Mastatine",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={lato.className} suppressHydrationWarning>
      <body className="verbosa-landing-page verbosa-magazine-two verbosa-magazine-layout verbosa-no-sidebar-back">
        <a
          href="#main"
          className="sr-only z-50 bg-white px-4 py-2 text-sm font-bold text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <AppShell shopUrl={getShopUrl()} sidebar={<Sidebar shopUrl={getShopUrl()} />} colophon={<Colophon />}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
