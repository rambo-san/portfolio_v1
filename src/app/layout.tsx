import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackgroundBlob } from "@/components/layout/BackgroundBlob";
import { TopBar } from "@/components/layout/TopBar";
import { Providers } from "@/components/Providers";
import { FriendsDrawer } from "@/components/layout/FriendsDrawer";
import { GameModeWrapper } from "@/components/layout/GameModeWrapper";
import { GameModeMain } from "@/components/layout/GameModeMain";
import { getSiteConfig } from "@/lib/firebase/siteConfig";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();

  return {
    title: config.siteName,
    description: config.siteDescription,
    openGraph: {
      title: config.siteName,
      description: config.siteDescription,
      images: config.logoUrl ? [config.logoUrl] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.siteName,
      description: config.siteDescription,
      images: config.logoUrl ? [config.logoUrl] : [],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getSiteConfig();

  // Helper to convert hex to RGB space-separated string for Tailwind
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
      `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` :
      '220 38 38'; // Default red rgb
  };

  const primaryRgb = hexToRgb(config.colors.primary);

  return (
    <html lang="en" className="dark" style={{ scrollBehavior: 'smooth', backgroundColor: config.colors.background }}>
      <head>
        {/* Anti-Flicker Style Injection */}
        <style id="theme-variables" dangerouslySetInnerHTML={{
          __html: `
          :root {
            --background: ${config.colors.background};
            --foreground: ${config.colors.text};
            --primary: ${config.colors.primary};
            --primary-rgb: ${primaryRgb};
            --secondary: ${config.colors.secondary};
            --card: ${config.colors.surface};
            --text-muted: ${config.colors.textMuted};
            --border: rgba(${primaryRgb}, 0.15);
          }
          html {
            background-color: ${config.colors.background};
            color: ${config.colors.text};
          }
        `}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <Providers>
          <BackgroundBlob />
          <TopBar />

          <GameModeMain>
            {children}
          </GameModeMain>

          <Footer />
          <GameModeWrapper>
            <Navbar />
            <FriendsDrawer />
          </GameModeWrapper>
        </Providers>
      </body>
    </html>
  );
}
