import type { Metadata } from "next";
import QuizGame from "@/features/games/seberapa-kenal/quiz-game";
import {
  COUPLE_QUIZ_SLUG,
  GAME_CATALOG,
} from "@/features/platform/game-registry";
import { localizeText } from "@/features/platform/i18n/locale";
import { getServerLocale } from "@/features/platform/i18n/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const game = GAME_CATALOG.find(({ slug }) => slug === COUPLE_QUIZ_SLUG)!;

  return {
    title: localizeText(locale, game.title),
    description: localizeText(locale, game.description),
  };
}

export default function SeberapaKenalPage() {
  return <QuizGame />;
}
