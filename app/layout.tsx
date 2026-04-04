import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Iota - Card Game of Matching Patterns",
  description:
    "Play Iota, the strategic card game where every card has a color, shape, and number. Match patterns, score points, and challenge AI opponents or friends online.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Iota",
  },
  openGraph: {
    title: "Iota - Card Game",
    description: "The strategic card game of matching patterns. Play solo or with friends.",
    type: "website",
    siteName: "Iota",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
