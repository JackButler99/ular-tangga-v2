"use client";

import Link from "next/link";
import {
  GAME_CATALOG,
  type GameCatalogItem,
} from "@/features/platform/game-registry";
import { useAppLanguage } from "@/features/platform/i18n/language-provider";
import { localizeText } from "@/features/platform/i18n/locale";

function GameCard({ game }: { game: GameCatalogItem }) {
  const { locale, pick } = useAppLanguage();
  const content = (
    <>
      <div className="flex items-start justify-between">
        <span className="text-3xl">{game.symbol}</span>
        <span className="text-xs font-bold tracking-wider text-pink-400">
          {game.status === "available"
            ? pick("MAIN SEKARANG", "PLAY NOW")
            : pick("SEGERA HADIR", "COMING SOON")}
        </span>
      </div>

      <h2 className="mt-10 text-xl font-semibold">
        {localizeText(locale, game.title)}
      </h2>

      <p className="mt-3 leading-6 text-zinc-400">
        {localizeText(locale, game.description)}
      </p>

      <div className="mt-6 flex gap-3 text-xs text-zinc-500">
        <span>{localizeText(locale, game.mood)}</span>
        <span>•</span>
        <span>{localizeText(locale, game.duration)}</span>
      </div>
    </>
  );

  const className =
    "block rounded-3xl border border-white/10 bg-white/5 p-6 transition";

  if (game.href) {
    return (
      <Link
        href={game.href}
        className={`${className} hover:-translate-y-1 hover:border-pink-400/40`}
      >
        {content}
      </Link>
    );
  }

  return (
    <article className={`${className} opacity-60`}>
      {content}
    </article>
  );
}

export default function Home() {
  const { pick } = useAppLanguage();

  return (
    <main className="min-h-screen bg-[#090812] px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-bold tracking-[0.2em] text-pink-400">
          MAIN BERDUA
        </p>

        <h1 className="mt-4 max-w-3xl text-5xl font-bold tracking-tight">
          {pick(
            "Permainan untuk waktu berdua.",
            "Games for time together.",
          )}
        </h1>

        <p className="mt-5 max-w-xl leading-7 text-zinc-400">
          {pick(
            "Pilih permainan, buat ruang privat, lalu undang pasangan melalui kode room.",
            "Choose a game, create a private room, and invite your partner with the room code.",
          )}
        </p>

        <section className="mt-12 grid gap-5 md:grid-cols-3">
          {GAME_CATALOG.map((game) => (
            <GameCard game={game} key={game.slug} />
          ))}
        </section>
      </div>
    </main>
  );
}
