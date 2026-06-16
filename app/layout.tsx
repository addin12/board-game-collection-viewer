import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const DESCRIPTION = "Boardgamers' Planet — the Barudak Board Game Club collection hub.";

export const metadata: Metadata = {
  metadataBase: new URL('https://board-game-collection-viewer.vercel.app'),
  title: {
    template: '%s | BBGC',
    default: 'BBGC — Barudak Board Game Club',
  },
  description: DESCRIPTION,
  openGraph: {
    title: 'BBGC — Barudak Board Game Club',
    description: DESCRIPTION,
    siteName: 'BBGC',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BBGC — Barudak Board Game Club',
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} h-full antialiased`}>
      <body>{children}</body>
    </html>
  );
}
