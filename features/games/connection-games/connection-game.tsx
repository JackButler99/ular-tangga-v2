"use client";

import Link from "next/link";
import {
  type FormEvent,
  type ReactNode,
  useState,
} from "react";

import { QuestionCountPicker } from "@/features/platform/components/question-count-picker";
import type { ConnectionGameSlug } from "@/features/platform/game-registry";
import {
  DEFAULT_QUESTION_COUNT,
  type QuestionCount,
} from "@/features/platform/question-count";
import type { PlayerRole } from "@/features/platform/room/types";

import type {
  PickOneAnswer,
  PickOneChapter,
} from "./content";
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
            ← Katalog
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
  return message ? (
    <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
      {message}
    </p>
  ) : null;
}

function GameInstructions({
  compact = false,
}: {
  compact?: boolean;
}) {
  const rules = (
    <div className="mt-5 border-t border-white/10 pt-5">
      <p className="text-sm leading-6 text-zinc-400">
        Tujuan permainan adalah mengumpulkan{" "}
        <strong className="text-fuchsia-200">
          spark
        </strong>{" "}
        dengan memilih jawaban yang sama. Tidak ada
        jawaban benar atau salah. Pilihan berbeda justru
        membuka bahan obrolan baru.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          {
            number: "1",
            title: "Pilih diam-diam",
            description:
              "Kalian memilih A atau B tanpa memberi bocoran. Jawaban baru terbuka setelah keduanya memilih.",
          },
          {
            number: "2",
            title: "Gunakan Heart Bet",
            description:
              "Masing-masing memiliki 2 bet. Aktifkan sebelum memilih jika yakin jawaban kalian akan sama.",
          },
          {
            number: "3",
            title: "Kumpulkan spark",
            description:
              "Pilihan sama memberi 1 spark. Setiap ronde ke-4 adalah Jackpot dengan 2 spark dasar.",
          },
          {
            number: "4",
            title: "Nikmati hasilnya",
            description:
              "Bangun streak, lakukan misi setelah reveal, lalu host melanjutkan ke ronde berikutnya.",
          },
        ].map((rule) => (
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
          CARA KERJA HEART BET
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-300">
          Setiap Heart Bet menambah{" "}
          <strong>+1 spark</strong> jika jawaban kalian
          sama. Jika kalian berdua memasang bet, bonusnya
          menjadi +2. Bet tetap terpakai ketika jawaban
          berbeda, jadi pilih momennya dengan cermat.
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        {[
          {
            label: "Jawaban sama",
            score: "+1 ✨",
          },
          {
            label: "Sama + 1 bet",
            score: "+2 ✨",
          },
          {
            label: "Sama + 2 bet",
            score: "+3 ✨",
          },
          {
            label: "Jackpot + 2 bet",
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
        Streak bertambah ketika jawaban kalian sama secara
        berurutan dan kembali ke nol ketika pilihan berbeda.
        Hanya host yang dapat melanjutkan ronde.
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
              Cara bermain
            </strong>

            <span className="text-xs text-zinc-500">
              Aturan spark, Heart Bet, dan Jackpot
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
            CARA BERMAIN
          </p>

          <h2 className="mt-1 text-xl font-black">
            Kompak menghasilkan spark
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
    label: string;
  }
> = {
  pemanasan: {
    emoji: "⚡",
    label: "Pemanasan",
  },
  koneksi: {
    emoji: "💞",
    label: "Makin Dekat",
  },
  "lebih-dalam": {
    emoji: "🌙",
    label: "Lebih Dalam",
  },
};

function resultPersona(score: number) {
  if (score >= 75) {
    return {
      emoji: "📡",
      title: "Duo Satu Frekuensi",
      description:
        "Kalian sering menangkap sinyal yang sama—bahkan sebelum sempat memberi bocoran.",
    };
  }

  if (score >= 45) {
    return {
      emoji: "🧩",
      title: "Duo Saling Melengkapi",
      description:
        "Ada cukup banyak kesamaan untuk terasa dekat, dan cukup banyak perbedaan untuk terus penasaran.",
    };
  }

  return {
    emoji: "🎭",
    title: "Duo Penuh Kejutan",
    description:
      "Kalian sulit ditebak—dan justru punya banyak cerita baru untuk saling ditemukan.",
  };
}

export default function ConnectionGame({
  gameSlug,
}: {
  gameSlug: ConnectionGameSlug;
}) {
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
            Membuka room…
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
            PILIH MANA?
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Dua pilihan. Satu kejutan.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">
            Mulai dari pilihan receh, naik ke obrolan yang
            lebih dekat, lalu pertaruhkan keyakinanmu
            menggunakan Heart Bet.
          </p>

          <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <span className="text-xl">🤫</span>

              <strong className="mt-3 block text-sm">
                Pilih rahasia
              </strong>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Jawaban baru terbuka saat kalian berdua
                sudah memilih.
              </p>
            </div>

            <div className="rounded-2xl border border-rose-300/15 bg-rose-300/[0.04] p-4">
              <span className="text-xl">♥</span>

              <strong className="mt-3 block text-sm">
                Pasang Heart Bet
              </strong>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Gunakan pada momen ketika kalian pasti
                satu frekuensi.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-4">
              <span className="text-xl">✨</span>

              <strong className="mt-3 block text-sm">
                Kejar spark
              </strong>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Bangun streak dan manfaatkan ronde
                Jackpot.
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
              BUAT ROOM BARU
            </p>

            <label
              htmlFor="create-name"
              className="mt-6 block text-sm font-medium text-zinc-300"
            >
              Nama panggilanmu
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
              placeholder="Misalnya: Ara"
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
                ? "Menyiapkan…"
                : "Buat room & undang pasangan"}
            </button>
          </form>

          <form
            onSubmit={handleOpen}
            className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6"
          >
            <p className="text-xs font-bold tracking-[0.18em] text-zinc-500">
              PUNYA KODE?
            </p>

            <label
              htmlFor="room-code"
              className="mt-6 block text-sm font-medium text-zinc-300"
            >
              Kode room
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
              Buka room
            </button>

            <p className="mt-8 rounded-2xl border border-white/5 bg-black/10 p-4 text-sm leading-6 text-zinc-500">
              Tidak perlu akun. Room hanya untuk dua
              pemain dan pilihan tetap rahasia sampai
              keduanya menjawab.
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
            UNDANGAN BERMAIN
          </p>

          <h1 className="mt-5 text-3xl font-black">
            {room.players.host} menunggumu.
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            Room{" "}
            <strong className="font-mono text-white">
              {room.code}
            </strong>
          </p>

          <GameInstructions />

          {roomFull ? (
            <p className="mt-8 rounded-2xl bg-black/20 p-4 text-zinc-300">
              Room ini sudah memiliki dua pemain.
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
                Nama panggilanmu
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
                placeholder="Misalnya: Bima"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 outline-none focus:border-white/30"
              />

              <button
                type="submit"
                disabled={busy}
                className="mt-4 w-full rounded-2xl bg-fuchsia-500 px-5 py-3.5 font-bold hover:bg-fuchsia-400 disabled:opacity-50"
              >
                {busy
                  ? "Bergabung…"
                  : "Gabung bermain"}
              </button>
            </form>
          )}

          <ErrorMessage message={error} />

          <button
            type="button"
            onClick={leaveRoom}
            className="mt-7 text-sm text-zinc-500 hover:text-white"
          >
            Kembali
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
            ROOM SIAP
          </p>

          <h1 className="mt-3 font-mono text-4xl font-black tracking-[0.14em] sm:text-5xl">
            {room.code}
          </h1>

          <p className="mx-auto mt-5 max-w-sm text-zinc-400">
            Bagikan tautannya. Permainan otomatis dimulai
            ketika pasanganmu masuk.
          </p>

          <button
            type="button"
            onClick={() =>
              void copyInvite()
            }
            className="mt-8 rounded-2xl bg-fuchsia-500 px-7 py-3.5 font-bold hover:bg-fuchsia-400"
          >
            {copied
              ? "Tautan tersalin ✓"
              : "Salin tautan undangan"}
          </button>

          <button
            type="button"
            onClick={leaveRoom}
            className="mt-6 block w-full text-sm text-zinc-500 hover:text-white"
          >
            Keluar dari room
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

    const persona = resultPersona(score);

    return (
      <Shell>
        <section className="mt-14 rounded-[2rem] border border-fuchsia-400/20 bg-gradient-to-b from-fuchsia-400/10 to-white/[0.03] p-8 text-center sm:p-12">
          <div className="text-6xl">
            {persona.emoji}
          </div>

          <p className="mt-6 text-xs font-bold tracking-[0.2em] text-fuchsia-300">
            IDENTITAS DUO KALIAN
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
                💞 Sejalan
              </span>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-md text-sm leading-6 text-zinc-500">
            {game.matchCount} dari{" "}
            {game.totalRounds} pilihan kalian sama.
            Perbedaan bukan kekalahan—itu bahan obrolan
            baru.
          </p>

          <button
            type="button"
            onClick={leaveRoom}
            className="mt-8 rounded-2xl bg-fuchsia-500 px-7 py-3.5 font-bold hover:bg-fuchsia-400"
          >
            Main game lain
          </button>
        </section>
      </Shell>
    );
  }

  const chosenOption =
    game.prompt.options.find(
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

  const chapter =
    CHAPTER_META[game.prompt.chapter];

  function optionLabel(
    answer: PickOneAnswer | null,
  ) {
    return (
      game.prompt.options.find(
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
            ROOM {room.code}
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Pilih Mana?
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
            ? "Tersalin ✓"
            : "Undang"}
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
                ? "Jawaban terkunci ✓"
                : "Sedang memilih…"}
            </p>
          </div>
        ))}
      </div>

      <GameInstructions compact />

      <section className="mt-5 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              {game.prompt.category}
            </span>

            <span className="rounded-full bg-white/5 px-2.5 py-1 text-zinc-300">
              {chapter.emoji}{" "}
              {chapter.label}
            </span>

            {game.powerRound && (
              <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 font-black text-amber-200">
                JACKPOT ×2
              </span>
            )}
          </div>

          <span>
            Ronde {game.round}/
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
          {game.prompt.prompt}
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
                      ? "Heart Bet terpasang"
                      : "Yakin bakal kompak? Pasang Heart Bet"}
                  </strong>

                  <span className="mt-1 block text-xs leading-5 text-zinc-500">
                    Jika jawaban sama, pilihan ini
                    memberi +1 spark ekstra.
                  </span>
                </span>

                <span className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs text-rose-200">
                  {game.yourBetsRemaining} tersisa
                </span>
              </button>

              {game.powerRound && (
                <p className="mb-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                  ⚡ Power Round: jawaban yang sama
                  bernilai 2 spark sebelum bonus
                  Heart Bet.
                </p>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {game.prompt.options.map(
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
                PILIHANMU TERKUNCI
              </p>

              <p className="mt-3 font-semibold">
                {chosenOption?.emoji}{" "}
                {chosenOption?.label}
              </p>

              <p className="mt-3 text-sm text-zinc-400">
                Menunggu pasanganmu menjawab tanpa
                bocoran…
              </p>

              {game.yourBet && (
                <p className="mt-4 inline-flex rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-xs font-bold text-rose-200">
                  ♥ Heart Bet aktif
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
                  ? "Hati kalian searah!"
                  : "Dua pilihan, dua cerita."}
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
                    ? "MISI KOMPAK"
                    : "OBROLKAN INI"}
                </p>

                <p className="mt-2 leading-6 text-zinc-300">
                  {matched
                    ? "Dalam 15 detik, sepakati satu cara kecil untuk membawa pilihan ini ke date kalian berikutnya."
                    : game.prompt
                        .reflection}
                </p>
              </div>

              {!matched &&
                anyRevealedBet && (
                  <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm leading-6 text-rose-100">
                    <strong>
                      Plot twist Heart Bet:
                    </strong>{" "}
                    pemain yang memasang bet mendapat
                    20 detik untuk menjual
                    pilihannya. Pasangan boleh berubah
                    pikiran tanpa kehilangan spark.
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
                  ? "Lihat hasil akhir"
                  : "Pilihan berikutnya"}
              </button>
            ) : (
              <p className="mt-7 text-center text-sm text-zinc-500">
                Menunggu{" "}
                {room.players.host}{" "}
                melanjutkan…
              </p>
            )}
          </div>
        )}

        <ErrorMessage message={error} />
      </section>
    </Shell>
  );
}