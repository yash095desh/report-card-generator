import type { Metadata } from "next";
import { Hind, Noto_Sans, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import "./tool.css";
import "./marksheet.css";

// Self-hosted by next/font, so the printed sheet never falls back to another face.
const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700", "800"],
});

const hind = Hind({
  variable: "--font-hind",
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Marksheet Maker · Pragya Public School",
  description: "Make printable marksheets for Pragya Public School, Nursery to Class 10.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${notoSans.variable} ${notoDevanagari.variable} ${hind.variable}`}>
      <body>{children}</body>
    </html>
  );
}
