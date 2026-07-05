import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RoadmapProvider } from "@/context/RoadmapContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CourseCraft AI - Forge Your Personalized Learning Path",
  description: "Generate customized learning roadmaps, curated resources, and practical projects for any career goal, powered by Google Gemini AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-white">
        <RoadmapProvider>
          {children}
        </RoadmapProvider>
      </body>
    </html>
  );
}
