import type { Metadata } from "next";
import SnakeLadderGame from "@/features/games/ular-tangga/snake-ladder-game";
import {
  GAME_CATALOG,
  SNAKE_LADDER_SLUG,
} from "@/features/platform/game-registry";
import { localizeText } from "@/features/platform/i18n/locale";
import { getServerLocale } from "@/features/platform/i18n/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const game = GAME_CATALOG.find(({ slug }) => slug === SNAKE_LADDER_SLUG)!;

  return {
    title: localizeText(locale, game.title),
    description: localizeText(locale, game.description),
  };
}

export default function UlarTanggaPage() {
  return <SnakeLadderGame />;
}
