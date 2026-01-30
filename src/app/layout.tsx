import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { getSiteConfig } from "@/lib/firebase/siteConfig";
import { SiteLayout } from '@/components/layout/SiteLayout';

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
    icons: {
      icon: [
        { url: `${config.faviconUrl || '/favicon.ico'}?v=${Date.now()}`, type: 'image/x-icon' },
        { url: `${config.faviconUrl || '/favicon.ico'}?v=${Date.now()}`, rel: 'shortcut icon', type: 'image/x-icon' },
      ],
      apple: [
        { url: `${config.faviconUrl || '/favicon.ico'}?v=${Date.now()}` },
      ],
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

  // Serialize config to plain object for Client Component prop safety (removes Firebase Timestamps)
  const serializedConfig = JSON.parse(JSON.stringify(config));

  return (
    <html lang="en" className="dark" style={{ scrollBehavior: 'smooth', backgroundColor: config.colors.background }}>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
          :root {
            --primary: ${config.colors.primary};
            --primary-rgb: ${primaryRgb};
            --secondary: ${config.colors.secondary};
            --accent: ${config.colors.accent};
            --background: ${config.colors.background};
            --foreground: ${config.colors.text};
            --card: ${config.colors.surface};
            --border: ${config.colors.text};
            --border-radius: ${config.theme.borderRadius};
            --border-width: ${config.theme.borderWidth};
          }
        `}} />
        <link rel="icon" type="image/x-icon" href={`${config.faviconUrl || '/favicon.ico'}?v=${Date.now()}`} />
        <link rel="shortcut icon" type="image/x-icon" href={`${config.faviconUrl || '/favicon.ico'}?v=${Date.now()}`} />
        <link rel="apple-touch-icon" href={`${config.faviconUrl || '/favicon.ico'}?v=${Date.now()}`} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col text-foreground`}
      >
        <Providers initialConfig={serializedConfig}>
          <SiteLayout>
            {children}
          </SiteLayout>
        </Providers>
      </body>
    </html>
  );
}
