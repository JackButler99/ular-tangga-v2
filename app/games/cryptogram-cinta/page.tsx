import type { Metadata } from "next";

import CryptogramGame from "@/features/games/cryptogram-cinta/cryptogram-game";
import {
  CRYPTOGRAM_CINTA_SLUG,
  GAME_CATALOG,
} from "@/features/platform/game-registry";
import { localizeText } from "@/features/platform/i18n/locale";
import { getServerLocale } from "@/features/platform/i18n/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const game = GAME_CATALOG.find(({ slug }) => slug === CRYPTOGRAM_CINTA_SLUG)!;

  return {
    title: localizeText(locale, game.title),
    description: localizeText(locale, game.description),
  };
}

export default function CryptogramCintaPage() {
  return <CryptogramGame />;
}
