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

import { TorchOverlay } from "@/components/layout/TorchOverlay";

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
            --accent: ${config.colors.accent};
            --card: ${config.colors.surface};
            --text-muted: ${config.colors.textMuted};
            --border: ${config.colors.text}; /* Default high contrast border */
            
            /* Neo-Brutalist Theme Variables */
            --border-width: ${config.theme.borderWidth};
            --border-radius: ${config.theme.borderRadius};
            --box-shadow: ${config.theme.boxShadow};
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
          <TorchOverlay />
          <div className="bg-grain" />
          <BackgroundBlob />
          <TopBar />

          <GameModeMain>
            <div className="flex flex-col relative w-full overflow-x-hidden">
              {/* Main content layer that hides the footer */}
              <main className="relative z-10 bg-background shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex-grow w-full min-h-screen">
                {children}
                {/* 
                   Scroll target for the navbar contact link. 
                   Placed slightly above the absolute bottom so the scroll stops 
                   perfectly where the reveal starts.
                */}
                <div id="contact" className="h-px w-full pointer-events-none mt-[-1px]" />
              </main>

              {/* Sticky Footer layer underneath */}
              <div className="sticky bottom-0 -z-10 w-full bg-foreground">
                <Footer />
              </div>
            </div>
          </GameModeMain>


          <GameModeWrapper>
            <Navbar />
            <FriendsDrawer />
          </GameModeWrapper>
        </Providers>
      </body>
    </html>
  );
}
