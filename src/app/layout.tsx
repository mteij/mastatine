import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "S.A. Mastatine — The study association for transmission tower enthusiasts",
  description:
    "S.A. Mastatine is the study association for Advanced Tower Technology. Submit and vote on the finest transmission towers, masts and electromagnetic structures.",
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
    <html lang="nl" className={`${lato.className} h-full`}>
      <body className="min-h-screen flex flex-col bg-white antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
