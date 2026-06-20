import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Caveat, Ma_Shan_Zheng } from "next/font/google";
import "./globals.css";
import { getLang } from "@/lib/lang";
import { getTheme } from "@/lib/theme";
import { LangProvider } from "@/components/lang-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 周报剪纸风用：手写体（拉丁）+ 毛笔体（中文）。preload:false → 只在用到的页面加载
const handFont = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  preload: false,
});

const brushFont = Ma_Shan_Zheng({
  variable: "--font-brush",
  weight: "400",
  preload: false,
});

export const metadata: Metadata = {
  title: "DateDrop",
  description: "每周四，一份为你们俩定制的周六约会计划，自动送达",
  applicationName: "DateDrop",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DateDrop",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#fafafa",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLang();
  const theme = await getTheme();
  return (
    <html
      lang={lang === "en" ? "en" : "zh-CN"}
      data-theme={theme}
      style={{ colorScheme: theme === "midnight" ? "dark" : "light" }}
      className={`${geistSans.variable} ${geistMono.variable} ${handFont.variable} ${brushFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LangProvider initial={lang}>{children}</LangProvider>
      </body>
    </html>
  );
}
