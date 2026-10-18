"use client";

import Link from "next/link";
import {
  type FormEvent,
  type ReactNode,
  useState,
} from "react";

import { QuestionCountPicker } from "@/features/platform/components/question-count-picker";
import type { ConnectionGameSlug } from "@/features/platform/game-registry";
import { useAppLanguage } from "@/features/platform/i18n/language-provider";
import { localizeRuntimeText } from "@/features/platform/i18n/runtime-text";
import {
  DEFAULT_QUESTION_COUNT,
  type QuestionCount,
} from "@/features/platform/question-count";
import type { PlayerRole } from "@/features/platform/room/types";

import type {
  PickOneAnswer,
  PickOneChapter,
} from "./content";
import { getLocalizedPickOneRound } from "./content";
import type { ConnectionRoomView } from "./room-view";
import { useConnectionRoom } from "./use-connection-room";

function playerName(
  room: ConnectionRoomView,
  role: PlayerRole,
) {
  return role === "host"
    ? room.players.host
    : room.players.guest ?? "Pasangan";
}

function Shell({
  children,
}: {
  children: ReactNode;
}) {
  const { pick } = useAppLanguage();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080710] px-5 py-8 text-white">
      <div className="pointer-events-none absolute -left-32 top-8 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-64 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-3xl">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white"
          >
            ← {pick("Katalog", "Games")}
          </Link>

          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-fuchsia-400/30 bg-fuchsia-400/10 text-xl text-fuchsia-300">
            ◇
          </div>
        </nav>

        {children}
      </div>
    </main>
  );
}

function ErrorMessage({
  message,
}: {
  message: string;
}) {
  const { locale } = useAppLanguage();

  return message ? (
    <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
      {localizeRuntimeText(locale, message)}
    </p>
  ) : null;
}

function GameInstructions({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { pick } = useAppLanguage();

  const ruleItems = [
    {
      number: "1",
      title: pick("Pilih secara pribadi", "Choose privately"),
      description: pick(
        "Kalian memilih A atau B tanpa memberi petunjuk. Jawaban terbuka setelah keduanya memilih.",
        "Each of you chooses A or B without giving hints. Answers are revealed after both choices are submitted.",
      ),
    },
    {
      number: "2",
      title: pick("Gunakan Heart Bet", "Use a Heart Bet"),
      description: pick(
        "Masing-masing memiliki dua bet. Aktifkan sebelum memilih jika yakin jawaban kalian akan sama.",
        "Each player has two bets. Activate one before choosing if you expect your answers to match.",
      ),
    },
    {
      number: "3",
      title: pick("Kumpulkan spark", "Collect sparks"),
      description: pick(
        "Pilihan yang sama memberi satu spark. Setiap ronde keempat adalah Jackpot dengan dua spark dasar.",
        "A match earns one spark. Every fourth round is a Jackpot worth two base sparks.",
      ),
    },
    {
      number: "4",
      title: pick("Tinjau hasilnya", "Review the result"),
      description: pick(
        "Bangun streak, selesaikan misi setelah hasil terbuka, lalu host melanjutkan ke ronde berikutnya.",
        "Build a streak, complete the post-reveal prompt, then let the host continue to the next round.",
      ),
    },
  ];

  const rules = (
    <div className="mt-5 border-t border-white/10 pt-5">
      <p className="text-sm leading-6 text-zinc-400">
        {pick(
          "Tujuan permainan ini adalah mengumpulkan",
          "The goal is to collect",
        )}{" "}
        <strong className="text-fuchsia-200">
          spark
        </strong>{" "}
        {pick(
          "dengan memilih jawaban yang sama. Tidak ada jawaban benar atau salah; pilihan yang berbeda menjadi bahan percakapan baru.",
          "by choosing the same answer. There are no right or wrong answers; different choices create new conversations.",
        )}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {ruleItems.map((rule) => (
          <div
            key={rule.number}
            className="flex gap-3 rounded-2xl bg-black/20 p-4"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-fuchsia-400/15 text-sm font-black text-fuchsia-200">
              {rule.number}
            </span>

            <div>
              <strong className="text-sm">
                {rule.title}
              </strong>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {rule.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-300/[0.07] p-4">
        <p className="text-xs font-black tracking-[0.16em] text-rose-200">
          {pick("CARA KERJA HEART BET", "HOW HEART BETS WORK")}
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-300">
          {pick("Setiap Heart Bet menambah", "Each Heart Bet adds")}{" "}
          <strong>+1 spark</strong>{" "}
          {pick(
            "jika jawaban kalian sama. Jika kalian berdua memasang bet, bonusnya menjadi +2. Bet tetap terpakai ketika jawaban berbeda, jadi pilih waktunya dengan cermat.",
            "when your answers match. If both of you place a bet, the bonus becomes +2. A bet is still spent when answers differ, so use it carefully.",
          )}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        {[
          {
            label: pick("Jawaban sama", "Matching answers"),
            score: "+1 ✨",
          },
          {
            label: pick("Sama + 1 bet", "Match + 1 bet"),
            score: "+2 ✨",
          },
          {
            label: pick("Sama + 2 bet", "Match + 2 bets"),
            score: "+3 ✨",
          },
          {
            label: pick("Jackpot + 2 bet", "Jackpot + 2 bets"),
            score: "+4 ✨",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/10 bg-white/[0.035] p-3"
          >
            <span className="block text-zinc-500">
              {item.label}
            </span>

            <strong className="mt-1 block text-white">
              {item.score}
            </strong>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-5 text-zinc-500">
        {pick(
          "Streak bertambah untuk setiap jawaban sama berturut-turut dan kembali ke nol ketika pilihan berbeda. Hanya host yang dapat melanjutkan ronde.",
          "Your streak grows with consecutive matches and resets when your choices differ. Only the host can continue the round.",
        )}
      </p>
    </div>
  );

  if (compact) {
    return (
      <details className="group mt-5 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4">
        <summary className="flex cursor-pointer list-none items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-400/10 font-black text-fuchsia-200">
            ?
          </span>

          <span className="min-w-0 flex-1">
            <strong className="block text-sm">
              {pick("Cara bermain", "How to play")}
            </strong>

            <span className="text-xs text-zinc-500">
              {pick(
                "Aturan spark, Heart Bet, dan Jackpot",
                "Spark, Heart Bet, and Jackpot rules",
              )}
            </span>
          </span>

          <span className="text-zinc-500 transition group-open:rotate-180">
            ⌄
          </span>
        </summary>

        {rules}
      </details>
    );
  }

  return (
    <section className="mt-8 rounded-[2rem] border border-fuchsia-400/20 bg-white/[0.045] p-6 text-left sm:p-7">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-400/10 text-xl">
          🎮
        </span>

        <div>
          <p className="text-xs font-black tracking-[0.18em] text-fuchsia-300">
            {pick("CARA BERMAIN", "HOW TO PLAY")}
          </p>

          <h2 className="mt-1 text-xl font-black">
            {pick("Pilihan selaras menghasilkan spark", "Matching choices earn sparks")}
          </h2>
        </div>
      </div>

      {rules}
    </section>
  );
}

const CHAPTER_META: Record<
  PickOneChapter,
  {
    emoji: string;
    label: { id: string; en: string };
  }
> = {
  pemanasan: {
    emoji: "⚡",
    label: { id: "Pemanasan", en: "Warm-up" },
  },
  koneksi: {
    emoji: "💞",
    label: { id: "Makin Dekat", en: "Closer" },
  },
  "lebih-dalam": {
    emoji: "🌙",
    label: { id: "Lebih Dalam", en: "Deeper" },
  },
};

function resultPersona(
  score: number,
  pick: (indonesian: string, english: string) => string,
) {
  if (score >= 75) {
    return {
      emoji: "📡",
      title: pick("Duo Satu Frekuensi", "In-Sync Duo"),
      description: pick(
        "Kalian sering menangkap sinyal yang sama, bahkan tanpa memberi petunjuk.",
        "You often pick up the same signal, even without giving each other hints.",
      ),
    };
  }

  if (score >= 45) {
    return {
      emoji: "🧩",
      title: pick("Duo Saling Melengkapi", "Complementary Duo"),
      description: pick(
        "Kalian memiliki cukup banyak kesamaan untuk merasa dekat dan cukup banyak perbedaan untuk terus saling mengenal.",
        "You share enough to feel close and differ enough to keep learning about each other.",
      ),
    };
  }

  return {
    emoji: "🎭",
    title: pick("Duo Penuh Kejutan", "Unexpected Duo"),
    description: pick(
      "Pilihan kalian sulit ditebak, sehingga masih banyak hal yang dapat kalian pelajari satu sama lain.",
      "Your choices are hard to predict, leaving plenty for you to discover about each other.",
    ),
  };
}

export default function ConnectionGame({
  gameSlug,
}: {
  gameSlug: ConnectionGameSlug;
}) {
  const { locale, pick } = useAppLanguage();
  const {
    room,
    busy,
    booting,
    copied,
    error,
    createRoom,
    openRoom,
    joinRoom,
    performAction,
    copyInvite,
    leaveRoom,
  } = useConnectionRoom(gameSlug);

  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [questionCount, setQuestionCount] =
    useState<QuestionCount>(
      DEFAULT_QUESTION_COUNT,
    );

  const [betDraft, setBetDraft] = useState({
    round: 0,
    value: false,
  });

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    void createRoom(name, questionCount);
  }

  function handleOpen(event: FormEvent) {
    event.preventDefault();
    void openRoom(roomCode);
  }

  function handleJoin(event: FormEvent) {
    event.preventDefault();
    void joinRoom(name);
  }

  if (booting) {
    return (
      <Shell>
        <div className="mt-28 text-center">
          <div className="mx-auto h-10 w-10 animate-pulse rounded-2xl bg-fuchsia-400/10" />

          <p className="mt-5 text-zinc-400">
            {pick("Membuka ruang…", "Opening the room…")}
          </p>
        </div>
      </Shell>
    );
  }

  if (!room) {
    return (
      <Shell>
        <header className="mt-14 max-w-2xl">
          <p className="text-xs font-black tracking-[0.24em] text-fuchsia-300">
            {pick("PILIH MANA?", "PICK ONE")}
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            {pick("Dua pilihan. Satu kejutan.", "Two choices. One reveal.")}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">
            {pick(
              "Mulai dari pilihan ringan, lanjutkan ke percakapan yang lebih dekat, lalu gunakan Heart Bet saat kalian yakin akan memilih jawaban yang sama.",
              "Begin with easy choices, move into closer conversations, then use a Heart Bet when you expect to choose the same answer.",
            )}
          </p>

          <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <span className="text-xl">🤫</span>

              <strong className="mt-3 block text-sm">
                {pick("Pilih secara pribadi", "Choose privately")}
              </strong>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {pick(
                  "Jawaban terbuka setelah kalian berdua memilih.",
                  "Answers are revealed after both of you choose.",
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-rose-300/15 bg-rose-300/[0.04] p-4">
              <span className="text-xl">♥</span>

              <strong className="mt-3 block text-sm">
                {pick("Pasang Heart Bet", "Place a Heart Bet")}
              </strong>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {pick(
                  "Gunakan ketika kalian yakin akan memilih jawaban yang sama.",
                  "Use one when you expect your answers to match.",
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-4">
              <span className="text-xl">✨</span>

              <strong className="mt-3 block text-sm">
                {pick("Kumpulkan spark", "Collect sparks")}
              </strong>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {pick(
                  "Bangun streak dan manfaatkan ronde Jackpot.",
                  "Build a streak and make the most of Jackpot rounds.",
                )}
              </p>
            </div>
          </div>
        </header>

        <GameInstructions />

        <section className="mt-10 grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
          <form
            onSubmit={handleCreate}
            className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/20"
          >
            <p className="text-xs font-bold tracking-[0.18em] text-zinc-500">
              {pick("BUAT RUANG BARU", "CREATE A NEW ROOM")}
            </p>

            <label
              htmlFor="create-name"
              className="mt-6 block text-sm font-medium text-zinc-300"
            >
              {pick("Nama panggilanmu", "Your display name")}
            </label>

            <input
              id="create-name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              minLength={2}
              maxLength={20}
              required
              placeholder={pick("Misalnya: Ara", "For example: Alex")}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 outline-none transition focus:border-fuchsia-400/50"
            />

            <QuestionCountPicker
              value={questionCount}
              onChange={setQuestionCount}
              disabled={busy}
            />

            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full rounded-2xl bg-fuchsia-500 px-5 py-3.5 font-bold transition hover:bg-fuchsia-400 disabled:opacity-50"
            >
              {busy
                ? pick("Menyiapkan…", "Creating…")
                : pick("Buat ruang dan undang pasangan", "Create room and invite partner")}
            </button>
          </form>

          <form
            onSubmit={handleOpen}
            className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6"
          >
            <p className="text-xs font-bold tracking-[0.18em] text-zinc-500">
              {pick("PUNYA KODE?", "HAVE A CODE?")}
            </p>

            <label
              htmlFor="room-code"
              className="mt-6 block text-sm font-medium text-zinc-300"
            >
              {pick("Kode ruang", "Room code")}
            </label>

            <input
              id="room-code"
              value={roomCode}
              onChange={(event) =>
                setRoomCode(
                  event.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 8),
                )
              }
              required
              placeholder="ABC234XY"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 font-mono uppercase tracking-[0.2em] outline-none focus:border-white/30"
            />

            <button
              type="submit"
              disabled={
                busy || roomCode.length < 6
              }
              className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 font-semibold hover:bg-white/10 disabled:opacity-40"
            >
              {pick("Buka ruang", "Open room")}
            </button>

            <p className="mt-8 rounded-2xl border border-white/5 bg-black/10 p-4 text-sm leading-6 text-zinc-500">
              {pick(
                "Tidak perlu akun. Ruang hanya untuk dua pemain, dan pilihan tetap tersembunyi sampai keduanya menjawab.",
                "No account is required. Each room is for two players, and choices stay hidden until both have answered.",
              )}
            </p>
          </form>
        </section>

        <ErrorMessage message={error} />
      </Shell>
    );
  }

  if (!room.you) {
    const roomFull = Boolean(
      room.players.guest,
    );

    return (
      <Shell>
        <section className="mt-16 rounded-[2rem] border border-fuchsia-400/30 bg-fuchsia-400/10 p-7 text-center sm:p-10">
          <p className="text-xs font-black tracking-[0.22em] text-fuchsia-300">
            {pick("UNDANGAN BERMAIN", "GAME INVITATION")}
          </p>

          <h1 className="mt-5 text-3xl font-black">
            {room.players.host} {pick("menunggumu.", "is waiting for you.")}
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            {pick("Ruang", "Room")}{" "}
            <strong className="font-mono text-white">
              {room.code}
            </strong>
          </p>

          <GameInstructions />

          {roomFull ? (
            <p className="mt-8 rounded-2xl bg-black/20 p-4 text-zinc-300">
              {pick(
                "Ruang ini sudah memiliki dua pemain.",
                "This room already has two players.",
              )}
            </p>
          ) : (
            <form
              onSubmit={handleJoin}
              className="mx-auto mt-8 max-w-md text-left"
            >
              <label
                htmlFor="join-name"
                className="text-sm font-medium text-zinc-300"
              >
                {pick("Nama panggilanmu", "Your display name")}
              </label>

              <input
                id="join-name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                minLength={2}
                maxLength={20}
                required
                placeholder={pick("Misalnya: Bima", "For example: Sam")}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 outline-none focus:border-white/30"
              />

              <button
                type="submit"
                disabled={busy}
                className="mt-4 w-full rounded-2xl bg-fuchsia-500 px-5 py-3.5 font-bold hover:bg-fuchsia-400 disabled:opacity-50"
              >
                {busy
                  ? pick("Bergabung…", "Joining…")
                  : pick("Gabung bermain", "Join game")}
              </button>
            </form>
          )}

          <ErrorMessage message={error} />

          <button
            type="button"
            onClick={leaveRoom}
            className="mt-7 text-sm text-zinc-500 hover:text-white"
          >
            {pick("Kembali", "Back")}
          </button>
        </section>
      </Shell>
    );
  }

  if (room.status === "waiting") {
    return (
      <Shell>
        <section className="mt-16 rounded-[2rem] border border-fuchsia-400/30 bg-white/[0.045] p-8 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-fuchsia-400/10 text-3xl text-fuchsia-300">
            ◇
          </div>

          <p className="mt-7 text-xs font-bold tracking-[0.2em] text-zinc-500">
            {pick("RUANG SIAP", "ROOM READY")}
          </p>

          <h1 className="mt-3 font-mono text-4xl font-black tracking-[0.14em] sm:text-5xl">
            {room.code}
          </h1>

          <p className="mx-auto mt-5 max-w-sm text-zinc-400">
            {pick(
              "Bagikan tautannya. Permainan dimulai otomatis ketika pasanganmu bergabung.",
              "Share the link. The game starts automatically when your partner joins.",
            )}
          </p>

          <button
            type="button"
            onClick={() =>
              void copyInvite()
            }
            className="mt-8 rounded-2xl bg-fuchsia-500 px-7 py-3.5 font-bold hover:bg-fuchsia-400"
          >
            {copied
              ? pick("Tautan tersalin ✓", "Link copied ✓")
              : pick("Salin tautan undangan", "Copy invitation link")}
          </button>

          <button
            type="button"
            onClick={leaveRoom}
            className="mt-6 block w-full text-sm text-zinc-500 hover:text-white"
          >
            {pick("Keluar dari ruang", "Leave room")}
          </button>

          <ErrorMessage message={error} />
        </section>
      </Shell>
    );
  }

  const game = room.game;

  if (game.phase === "finished") {
    const score = Math.round(
      (game.matchCount /
        game.totalRounds) *
        100,
    );

    const persona = resultPersona(score, pick);

    return (
      <Shell>
        <section className="mt-14 rounded-[2rem] border border-fuchsia-400/20 bg-gradient-to-b from-fuchsia-400/10 to-white/[0.03] p-8 text-center sm:p-12">
          <div className="text-6xl">
            {persona.emoji}
          </div>

          <p className="mt-6 text-xs font-bold tracking-[0.2em] text-fuchsia-300">
            {pick("HASIL KALIAN", "YOUR RESULT")}
          </p>

          <h1 className="mt-3 text-4xl font-black">
            {persona.title}
          </h1>

          <p className="mx-auto mt-4 max-w-md text-zinc-400">
            {persona.description}
          </p>

          <div className="mx-auto mt-8 grid max-w-xl grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-4">
              <strong className="block text-xl text-fuchsia-200">
                {game.sparkCount}
              </strong>

              <span className="mt-1 block text-[11px] text-zinc-500">
                ✨ Spark
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-4">
              <strong className="block text-xl text-orange-200">
                {game.bestStreak}
              </strong>

              <span className="mt-1 block text-[11px] text-zinc-500">
                🔥 Streak
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-4">
              <strong className="block text-xl text-emerald-200">
                {score}%
              </strong>

              <span className="mt-1 block text-[11px] text-zinc-500">
                💞 {pick("Selaras", "Aligned")}
              </span>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-md text-sm leading-6 text-zinc-500">
            {pick(
              `${game.matchCount} dari ${game.totalRounds} pilihan kalian sama. Pilihan yang berbeda bukan kekalahan; gunakan sebagai bahan percakapan baru.`,
              `${game.matchCount} of ${game.totalRounds} choices matched. Different choices are not a loss; use them as new conversation starters.`,
            )}
          </p>

          <button
            type="button"
            onClick={leaveRoom}
            className="mt-8 rounded-2xl bg-fuchsia-500 px-7 py-3.5 font-bold hover:bg-fuchsia-400"
          >
            {pick("Mainkan permainan lain", "Play another game")}
          </button>
        </section>
      </Shell>
    );
  }

  const prompt = getLocalizedPickOneRound(
    game.prompt.id,
    locale,
  );

  const chosenOption =
    prompt.options.find(
      (option) =>
        option.id === game.yourAnswer,
    );

  const hostAnswer =
    game.revealedAnswers?.host ?? null;

  const guestAnswer =
    game.revealedAnswers?.guest ?? null;

  const matched =
    hostAnswer !== null &&
    hostAnswer === guestAnswer;

  const heartBetSelected =
    betDraft.round === game.round &&
    betDraft.value;

  const anyRevealedBet = Boolean(
    game.revealedBets?.host ||
      game.revealedBets?.guest,
  );

  const chapter = CHAPTER_META[prompt.chapter];

  function optionLabel(
    answer: PickOneAnswer | null,
  ) {
    return (
      prompt.options.find(
        (option) =>
          option.id === answer,
      )?.label ?? "—"
    );
  }

  return (
    <Shell>
      <header className="mt-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-[0.2em] text-fuchsia-300">
            {pick("RUANG", "ROOM")} {room.code}
          </p>

          <h1 className="mt-2 text-3xl font-black">
            {pick("Pilih Mana?", "Pick One")}
          </h1>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-1.5 text-fuchsia-100">
              ✨ {game.sparkCount} spark
            </span>

            <span className="rounded-full border border-orange-300/20 bg-orange-300/10 px-3 py-1.5 text-orange-100">
              🔥 {game.currentStreak} streak
            </span>

            <span className="rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-rose-100">
              💗 {game.yourBetsRemaining} Heart Bet
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            void copyInvite()
          }
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300 hover:bg-white/10"
        >
          {copied
            ? pick("Tersalin ✓", "Copied ✓")
            : pick("Undang", "Invite")}
        </button>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {(
          [
            "host",
            "guest",
          ] as const
        ).map((role) => (
          <div
            key={role}
            className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
          >
            <p className="truncate font-semibold">
              {playerName(room, role)}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {game.answered[role]
                ? pick("Jawaban terkunci ✓", "Answer locked ✓")
                : pick("Sedang memilih…", "Choosing…")}
            </p>
          </div>
        ))}
      </div>

      <GameInstructions compact />

      <section className="mt-5 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              {prompt.category}
            </span>

            <span className="rounded-full bg-white/5 px-2.5 py-1 text-zinc-300">
              {chapter.emoji}{" "}
              {chapter.label[locale]}
            </span>

            {game.powerRound && (
              <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 font-black text-amber-200">
                JACKPOT ×2
              </span>
            )}
          </div>

          <span>
            {pick("Ronde", "Round")} {game.round}/
            {game.totalRounds}
          </span>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-fuchsia-500 transition-all"
            style={{
              width: `${
                (game.round /
                  game.totalRounds) *
                100
              }%`,
            }}
          />
        </div>

        <h2 className="mt-8 text-2xl font-black leading-tight sm:text-3xl">
          {prompt.prompt}
        </h2>

        {game.phase === "answering" &&
          (game.yourAnswer === null ? (
            <div className="mt-7">
              <button
                type="button"
                disabled={
                  busy ||
                  game.yourBetsRemaining === 0
                }
                onClick={() =>
                  setBetDraft({
                    round: game.round,
                    value:
                      !heartBetSelected,
                  })
                }
                className={`mb-4 flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
                  heartBetSelected
                    ? "border-rose-300/50 bg-rose-400/15 shadow-lg shadow-rose-500/10"
                    : "border-white/10 bg-black/15 hover:border-rose-300/30"
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${
                    heartBetSelected
                      ? "bg-rose-400 text-white"
                      : "bg-rose-400/10"
                  }`}
                >
                  {heartBetSelected
                    ? "♥"
                    : "♡"}
                </span>

                <span className="min-w-0 flex-1">
                  <strong className="block text-sm">
                    {heartBetSelected
                      ? pick("Heart Bet terpasang", "Heart Bet placed")
                      : pick(
                          "Yakin pilihan kalian sama? Pasang Heart Bet",
                          "Expect a match? Place a Heart Bet",
                        )}
                  </strong>

                  <span className="mt-1 block text-xs leading-5 text-zinc-500">
                    {pick(
                      "Jika jawaban sama, pilihan ini memberi satu spark tambahan.",
                      "If your answers match, this choice earns one extra spark.",
                    )}
                  </span>
                </span>

                <span className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs text-rose-200">
                  {game.yourBetsRemaining} {pick("tersisa", "left")}
                </span>
              </button>

              {game.powerRound && (
                <p className="mb-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                  {pick(
                    "⚡ Ronde Jackpot: jawaban yang sama bernilai dua spark sebelum bonus Heart Bet.",
                    "⚡ Jackpot round: a match is worth two sparks before any Heart Bet bonus.",
                  )}
                </p>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {prompt.options.map(
                  (option) => (
                    <button
                      type="button"
                      key={option.id}
                      disabled={busy}
                      onClick={() =>
                        void performAction(
                          "pick-one-answer",
                          {
                            answer:
                              option.id,
                            useBet:
                              heartBetSelected,
                          },
                        )
                      }
                      className="rounded-3xl border border-white/10 bg-black/20 p-5 text-left transition hover:-translate-y-0.5 hover:border-fuchsia-400/50 hover:bg-fuchsia-400/10 disabled:opacity-50"
                    >
                      <span className="text-3xl">
                        {option.emoji}
                      </span>

                      <strong className="mt-4 block leading-6">
                        {option.label}
                      </strong>
                    </button>
                  ),
                )}
              </div>
            </div>
          ) : (
            <div className="mt-7 rounded-3xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-5">
              <p className="text-xs font-bold tracking-wider text-fuchsia-300">
                {pick("PILIHANMU TERKUNCI", "YOUR CHOICE IS LOCKED")}
              </p>

              <p className="mt-3 font-semibold">
                {chosenOption?.emoji}{" "}
                {chosenOption?.label}
              </p>

              <p className="mt-3 text-sm text-zinc-400">
                {pick(
                  "Menunggu pasanganmu menjawab…",
                  "Waiting for your partner to answer…",
                )}
              </p>

              {game.yourBet && (
                <p className="mt-4 inline-flex rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-xs font-bold text-rose-200">
                  ♥ {pick("Heart Bet aktif", "Heart Bet active")}
                </p>
              )}
            </div>
          ))}

        {game.phase === "reveal" && (
          <div className="mt-7">
            <div
              className={`rounded-3xl border p-6 ${
                matched
                  ? "border-emerald-400/30 bg-emerald-400/10"
                  : "border-amber-400/30 bg-amber-400/10"
              }`}
            >
              <p className="text-3xl">
                {matched ? "✨" : "🌗"}
              </p>

              <h3 className="mt-3 text-xl font-black">
                {matched
                  ? pick("Pilihan kalian selaras.", "Your choices match.")
                  : pick("Dua pilihan, dua sudut pandang.", "Two choices, two perspectives.")}
              </h3>

              {matched && (
                <p className="mt-3 inline-flex rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-sm font-black text-emerald-100">
                  +{game.lastSparkAward} spark ✨
                </p>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-black/15 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-zinc-500">
                      {room.players.host}
                    </p>

                    {game.revealedBets
                      ?.host && (
                      <span className="text-xs font-bold text-rose-200">
                        ♥ BET
                      </span>
                    )}
                  </div>

                  <p className="mt-2 font-semibold">
                    {optionLabel(
                      hostAnswer,
                    )}
                  </p>
                </div>

                <div className="rounded-2xl bg-black/15 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-zinc-500">
                      {room.players.guest}
                    </p>

                    {game.revealedBets
                      ?.guest && (
                      <span className="text-xs font-bold text-rose-200">
                        ♥ BET
                      </span>
                    )}
                  </div>

                  <p className="mt-2 font-semibold">
                    {optionLabel(
                      guestAnswer,
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-white/10 pt-5">
                <p className="text-xs font-bold tracking-wider text-zinc-500">
                  {matched
                    ? pick("MISI BERSAMA", "SHARED PROMPT")
                    : pick("OBROLKAN INI", "DISCUSS THIS")}
                </p>

                <p className="mt-2 leading-6 text-zinc-300">
                  {matched
                    ? pick(
                        "Dalam 15 detik, sepakati satu cara sederhana untuk membawa pilihan ini ke kencan kalian berikutnya.",
                        "In 15 seconds, agree on one simple way to bring this choice into your next date.",
                      )
                    : prompt.reflection}
                </p>
              </div>

              {!matched &&
                anyRevealedBet && (
                  <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm leading-6 text-rose-100">
                    <strong>
                      {pick("Hasil Heart Bet:", "Heart Bet result:")}
                    </strong>{" "}
                    {" "}
                    {pick(
                      "Pemain yang memasang bet mendapat 20 detik untuk menjelaskan pilihannya. Pasangan boleh berubah pikiran tanpa kehilangan spark.",
                      "The player who placed the bet has 20 seconds to make the case for their choice. Their partner may reconsider without losing a spark.",
                    )}
                  </div>
                )}
            </div>

            {room.you === "host" ? (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void performAction(
                    "pick-one-continue",
                  )
                }
                className="mt-7 w-full rounded-2xl bg-fuchsia-500 px-6 py-3.5 font-bold hover:bg-fuchsia-400 disabled:opacity-50"
              >
                {game.round ===
                game.totalRounds
                  ? pick("Lihat hasil akhir", "View final results")
                  : pick("Pilihan berikutnya", "Next choice")}
              </button>
            ) : (
              <p className="mt-7 text-center text-sm text-zinc-500">
                {pick("Menunggu", "Waiting for")}{" "}
                {room.players.host}{" "}
                {pick("melanjutkan…", "to continue…")}
              </p>
            )}
          </div>
        )}

        <ErrorMessage message={error} />
      </section>
    </Shell>
  );
}
