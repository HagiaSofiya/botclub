import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";

const recoleta = DM_Serif_Display({
  variable: "--font-recoleta",
  weight: "400",
  subsets: ["latin"],
});

const lota = Inter({
  variable: "--font-lota",
  weight: ["400", "700"],
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
      className={`${recoleta.variable} ${lota.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f5f4f0]">
        <header className="sticky top-0 z-10 border-b border-black/10 bg-[#f5f4f0]">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-center px-4 py-3">
            <span className="font-serif text-2xl font-bold text-foreground tracking-[-0.028em]">
              bot club
            </span>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
