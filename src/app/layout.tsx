import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Startup Hub",
  description: "A production-grade hub for connecting founders, contributors, and administrators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
