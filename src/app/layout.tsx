import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Newsreader, Space_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { TopNav } from "@/components/TopNav";

// Design system (design/Product design system guidelines): Hanken = UI,
// Newsreader = titles, Space Mono = AI/data readouts.
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Second Life Flowers",
  description:
    "Give your bouquet a second life — pass fresh flowers to someone nearby.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf7f2",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${newsreader.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <TopNav />
        <div className="min-h-dvh pb-20 lg:pb-10">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
