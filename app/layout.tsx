import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | BBGC',
    default: 'BBGC — Bekasi Board Game Community',
  },
  description: "Boardgamers' Planet, Bekasi — the Bekasi Board Game Community collection hub.",
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
