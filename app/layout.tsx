import type { Metadata } from "next";
import {
  Inter,
  Archivo_Black,
  Instrument_Serif,
  JetBrains_Mono,
  Caveat,
} from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LenisProvider } from "@/components/system/LenisProvider";
import { TimeThemeProvider } from "@/components/system/TimeThemeProvider";
import { Cursor } from "@/components/system/Cursor";
import { Atmosphere } from "@/components/system/Atmosphere";
import { IntroLoader } from "@/components/system/IntroLoader";
import { PixelPet } from "@/components/system/PixelPet";
import { PetChat } from "@/components/system/PetChat";
import { PageTransition } from "@/components/system/PageTransition";
import { ResumePreview } from "@/components/system/ResumePreview";
import { CommandPalette } from "@/components/system/CommandPalette";
import { Terminal } from "@/components/system/Terminal";
import { BingoOS } from "@/components/system/BingoOS";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontDisplay = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const fontBazilHero = Inter({
  subsets: ["latin"],
  variable: "--font-bazil-hero",
  display: "swap",
  axes: ["opsz"],
});

const fontSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const fontHand = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://xubinsun.com"),
  title: "Xubin Sun · Product × Engineering × Research · Yale '26",
  description:
    "Xubin Sun (孙徐斌) — heading to Yale University for Computer Science in Fall 2026. AI product, engineering, and research. Interned at Zoom, Alibaba Cloud, Deloitte. 3 publications (SCI Q1).",
  openGraph: {
    title: "Xubin Sun · Product × Engineering × Research · Yale '26",
    description:
      "Heading to Yale University for Computer Science in Fall 2026. Product-minded engineer, 3 publications (SCI Q1). Zoom, Alibaba Cloud, Deloitte.",
    type: "website",
    url: "https://xubinsun.com",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Xubin Sun · Product × Engineering × Research · Yale '26",
    description:
      "Heading to Yale University for Computer Science in Fall 2026. Product-minded engineer, 3 publications (SCI Q1). Zoom, Alibaba Cloud, Deloitte.",
    images: ["/og-image.png"],
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontBazilHero.variable} ${fontSerif.variable} ${fontMono.variable} ${fontHand.variable}`}
    >
      <head>
        {/* Synchronous blocking script — sets data-intro on <html> BEFORE
            any body content paints. Without this, the initial paint shows
            the landing page for a frame, then the IntroLoader mounts on
            top — i.e., "the loader appears AFTER the page flashes". With
            this script, data-intro is set in the parse phase, the CSS
            cover (body::before) kicks in instantly, and there's no flash. */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=sessionStorage.getItem('bingo:intro-seen:v6')==='1';var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(!s&&!r){document.documentElement.dataset.intro='running';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        <TimeThemeProvider>
          <LenisProvider>
            <I18nProvider>
              <Atmosphere />
              <Cursor />
              <IntroLoader />
              <Navbar />
              <PageTransition />
              <main className="min-h-screen">{children}</main>
              <CommandPalette />
              <ResumePreview />
              <Terminal />
              <BingoOS />
              <PixelPet />
              <PetChat />
              <Footer />
            </I18nProvider>
          </LenisProvider>
        </TimeThemeProvider>
      </body>
    </html>
  );
}
