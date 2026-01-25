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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Developer Portfolio | Interactive Experience",
  description: "A developer portfolio showcasing systems engineering and interactive web experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[#050505] text-[#e5e5e5]`}
      >
        <Providers>
          <BackgroundBlob />
          {/* TopBar always visible */}
          <TopBar />

          <GameModeMain>
            {children}
          </GameModeMain>

          <Footer />
          {/* Only bottom navbar and friends drawer hidden in game mode */}
          <GameModeWrapper>
            <Navbar />
            <FriendsDrawer />
          </GameModeWrapper>
        </Providers>
      </body>
    </html>
  );
}
