import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "bot club",
  description: "It's just you and the bots.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-10 border-b border-black/5 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-neutral-950/70">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-center px-4 py-3">
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-xl font-bold text-transparent">
              bot club
            </span>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
