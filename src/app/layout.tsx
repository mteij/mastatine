import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "S.A. Mastatine — Study Association for Transmission Towers",
  description:
    "The premier study association for the appreciation of transmission towers, masts, and all things electromagnetic. Submit and vote on the best masts.",
  openGraph: {
    title: "S.A. Mastatine",
    description: "Submit and vote on the best transmission towers.",
    url: "https://mastatine.nl",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${geist.variable} h-full`}>
      <body className="min-h-screen flex flex-col bg-slate-50 antialiased font-[var(--font-geist)]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
