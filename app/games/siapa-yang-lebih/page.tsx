import type { Metadata } from "next";

import MostLikelyGame from "@/features/games/siapa-yang-lebih/most-likely-game";
import {
  GAME_CATALOG,
  MOST_LIKELY_SLUG,
} from "@/features/platform/game-registry";
import { localizeText } from "@/features/platform/i18n/locale";
import { getServerLocale } from "@/features/platform/i18n/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const game = GAME_CATALOG.find(({ slug }) => slug === MOST_LIKELY_SLUG)!;

  return {
    title: localizeText(locale, game.title),
    description: localizeText(locale, game.description),
  };
}

export default function MostLikelyPage() {
  return <MostLikelyGame />;
}
