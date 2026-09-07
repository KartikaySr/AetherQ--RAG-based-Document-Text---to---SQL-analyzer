import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/providers/ToastProvider";
import { AuthProvider } from "@/providers/AuthProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050505",
};

const siteUrl =
  typeof process.env.NEXT_PUBLIC_SITE_URL === "string" &&
  process.env.NEXT_PUBLIC_SITE_URL.length > 0
    ? process.env.NEXT_PUBLIC_SITE_URL
    : null;

export const metadata: Metadata = {
  title: {
    default: "AetherQ | Mindineers Labs",
    template: "%s | AetherQ",
  },
  description:
    "Enterprise AI workspace — document intelligence, RAG retrieval, and Groq-backed reasoning.",
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
};

import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${playfair.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-[100dvh] bg-[#050505] pb-[env(safe-area-inset-bottom)] text-white antialiased">
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
