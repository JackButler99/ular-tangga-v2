import type { Metadata } from "next";

import LongingMazeGame from "@/features/games/labirin-rindu/longing-maze-game";
import {
  GAME_CATALOG,
  LONGING_MAZE_SLUG,
} from "@/features/platform/game-registry";
import { localizeText } from "@/features/platform/i18n/locale";
import { getServerLocale } from "@/features/platform/i18n/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const game = GAME_CATALOG.find(({ slug }) => slug === LONGING_MAZE_SLUG)!;

  return {
    title: localizeText(locale, game.title),
    description: localizeText(locale, game.description),
  };
}

export default function LongingMazePage() {
  return <LongingMazeGame />;
}
