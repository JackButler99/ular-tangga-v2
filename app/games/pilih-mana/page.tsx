import type { Metadata } from "next";

import ConnectionGame from "@/features/games/connection-games/connection-game";
import {
  GAME_CATALOG,
  PICK_ONE_SLUG,
} from "@/features/platform/game-registry";
import { localizeText } from "@/features/platform/i18n/locale";
import { getServerLocale } from "@/features/platform/i18n/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const game = GAME_CATALOG.find(({ slug }) => slug === PICK_ONE_SLUG)!;

  return {
    title: localizeText(locale, game.title),
    description: localizeText(locale, game.description),
  };
}

export default function PickOnePage() {
  return <ConnectionGame gameSlug={PICK_ONE_SLUG} />;
}
