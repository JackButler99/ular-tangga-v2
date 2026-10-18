import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import { RoomChat } from "@/features/platform/chat/room-chat";
import { AppLanguageProvider } from "@/features/platform/i18n/language-provider";
import { LanguageSwitcher } from "@/features/platform/i18n/language-switcher";
import { getServerLocale } from "@/features/platform/i18n/server-locale";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();

  return {
    title: {
      default: "Main Berdua",
      template: "%s | Main Berdua",
    },
    description:
      locale === "id"
        ? "Kumpulan permainan dua pemain untuk menikmati waktu bersama pasangan."
        : "A collection of two-player games for meaningful time together.",
  };
}

export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  const locale = await getServerLocale();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AppLanguageProvider initialLocale={locale}>
          {children}
          <LanguageSwitcher />
          <RoomChat />
        </AppLanguageProvider>
      </body>
    </html>
  );
}
