import Link from "next/link";
import {
  GAME_CATALOG,
  type GameCatalogItem,
} from "@/features/platform/game-registry";

function GameCard({ game }: { game: GameCatalogItem }) {
  const content = (
    <>
      <div className="flex items-start justify-between">
        <span className="text-3xl">{game.symbol}</span>
        <span className="text-xs font-bold tracking-wider text-pink-400">
          {game.status === "available" ? "MAIN SEKARANG" : "SEGERA HADIR"}
        </span>
      </div>

      <h2 className="mt-10 text-xl font-semibold">{game.title}</h2>

      <p className="mt-3 leading-6 text-zinc-400">
        {game.description}
      </p>

      <div className="mt-6 flex gap-3 text-xs text-zinc-500">
        <span>{game.mood}</span>
        <span>•</span>
        <span>{game.duration}</span>
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
  return (
    <main className="min-h-screen bg-[#090812] px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-bold tracking-[0.2em] text-pink-400">
          MAIN BERDUA
        </p>

        <h1 className="mt-4 max-w-3xl text-5xl font-bold tracking-tight">
          Selalu ada alasan untuk main berdua.
        </h1>

        <p className="mt-5 max-w-xl leading-7 text-zinc-400">
          Pilih suasana, undang pasanganmu, lalu mulai permainan langsung
          dari browser.
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