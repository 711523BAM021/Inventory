import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AIMS | Multi-Agent Inventory Reconciliation & Infrastructure Intelligence Platform",
  description: "Enterprise autonomous inventory synchronization, telemetry anomaly tracking, and supplier intelligence ledger system.",
  keywords: ["Inventory Reconciliation", "IoT Sensors", "FastAPI", "Next.js", "LangGraph", "Multi-Agent System"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full font-sans antialiased text-[#0F172A] bg-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}
