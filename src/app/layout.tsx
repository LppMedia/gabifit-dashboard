import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "@/components/providers/SessionProvider";

// Body — Barlow for clean, athletic readability
const barlow = Barlow({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Display — Barlow Condensed for bold headings & stat numbers
const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GabiFit Content Dashboard",
  description:
    "Manage Instagram, analytics, content calendar, competitors, and news in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${barlow.variable} ${barlowCondensed.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          <TooltipProvider delay={300}>{children}</TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
