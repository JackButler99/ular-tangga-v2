"use client";

import Link from "next/link";
import {
  type FormEvent,
  type ReactNode,
  useState,
} from "react";

import { otherPlayer } from "@/features/games/seberapa-kenal/engine";
import type { QuizRoomView } from "@/features/games/seberapa-kenal/room-view";
import { useQuizRoom } from "@/features/games/seberapa-kenal/use-quiz-room";
import { QuestionCountPicker } from "@/features/platform/components/question-count-picker";
import {
  DEFAULT_QUESTION_COUNT,
  type QuestionCount,
} from "@/features/platform/question-count";
import type { PlayerRole } from "@/features/platform/room/types";

function playerName(
  room: QuizRoomView,
  role: PlayerRole,
) {
  if (role === "host") {
    return room.players.host.name;
  }

  return room.players.guest?.name ?? "Pasangan";
}

function initialFrom(name: string | null | undefined) {
  return name?.trim().charAt(0).toUpperCase() || "?";
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#08070f] px-4 py-5 text-white sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute -left-36 -top-28 h-96 w-96 rounded-full bg-violet-600/20 blur-[110px]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-[110px]" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-zinc-300 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-400/60"
        >
          <span aria-hidden="true">←</span>
          <span>Kembali ke katalog</span>
        </Link>

        {children}
      </div>
    </main>
  );
}

function ErrorNotice({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className="mt-5 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
    >
      <span
        aria-hidden="true"
        className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-400/20 text-xs"
      >
        !
      </span>

      <p>{message}</p>
    </div>
  );
}

function PlayerAvatar({
  name,
  active = false,
  tone,
}: {
  name: string | null | undefined;
  active?: boolean;
  tone: "pink" | "violet";
}) {
  const toneClass =
    tone === "pink"
      ? "from-pink-400 to-rose-600 shadow-pink-500/20"
      : "from-violet-400 to-indigo-600 shadow-violet-500/20";

  return (
    <div className="relative shrink-0">
      <div
        className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br text-sm font-black shadow-lg ${toneClass}`}
      >
        {initialFrom(name)}
      </div>

      {active && (
        <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#13111d] bg-emerald-400" />
      )}
    </div>
  );
}

function Choices({
  options,
  disabled,
  onChoose,
}: {
  options: readonly string[];
  disabled: boolean;
  onChoose: (index: number) => void;
}) {
  const labels = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="mt-7 grid gap-3">
      {options.map((option, index) => (
        <button
          type="button"
          key={`${index}-${option}`}
          disabled={disabled}
          onClick={() => onChoose(index)}
          className="group flex min-h-16 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-400/50 hover:bg-violet-400/10 hover:shadow-lg hover:shadow-violet-950/30 focus:outline-none focus:ring-2 focus:ring-violet-400/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:px-5"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/20 text-xs font-black text-violet-200 transition group-hover:border-violet-400/30 group-hover:bg-violet-400/20">
            {labels[index] ?? index + 1}
          </span>

          <span className="font-medium leading-relaxed text-zinc-100">
            {option}
          </span>
        </button>
      ))}
    </div>
  );
}

function LoadingScreen() {
  return (
    <Shell>
      <div className="flex min-h-[70svh] flex-col items-center justify-center text-center">
        <div className="relative grid h-20 w-20 place-items-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/15" />
          <div className="relative grid h-14 w-14 place-items-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-2xl shadow-xl shadow-violet-950/40">
            💜
          </div>
        </div>

        <p className="mt-6 font-semibold">
          Membuka ruang bermain
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          Menyiapkan momen kalian…
        </p>
      </div>
    </Shell>
  );
}

export default function QuizGame() {
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
  } = useQuizRoom();

  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [questionCount, setQuestionCount] =
    useState<QuestionCount>(
      DEFAULT_QUESTION_COUNT,
    );

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
    return <LoadingScreen />;
  }

  if (!room) {
    return (
      <Shell>
        <div className="pb-12 pt-10 sm:pt-16">
          <header className="mx-auto max-w-2xl text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] border border-violet-300/20 bg-gradient-to-br from-violet-400/20 to-fuchsia-500/10 text-4xl shadow-2xl shadow-violet-950/50">
              💭
            </div>

            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-bold tracking-[0.18em] text-violet-200">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
              GAME UNTUK BERDUA
            </div>

            <h1 className="mt-5 bg-gradient-to-r from-white via-violet-100 to-fuchsia-200 bg-clip-text text-4xl font-black leading-tight text-transparent sm:text-6xl">
              Seberapa Kenal Kamu?
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
              Tebak pilihan pasanganmu, kumpulkan poin, dan
              temukan hal kecil yang belum pernah kalian
              bicarakan.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-zinc-400">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                👥 2 pemain
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                ⚡ 5–15 pertanyaan
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                🔒 Jawaban rahasia
              </span>
            </div>
          </header>

          <section className="mx-auto mt-10 max-w-xl overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/5 px-6 py-5 sm:px-8">
              <p className="text-xs font-bold tracking-[0.18em] text-violet-300">
                MULAI DATE NIGHT
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Buat ruang baru
              </h2>
            </div>

            <form
              onSubmit={handleCreate}
              className="p-6 sm:p-8"
            >
              <label
                htmlFor="create-name"
                className="text-sm font-semibold text-zinc-200"
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
                autoComplete="nickname"
                placeholder="Misalnya: Ara"
                className="mt-2 h-13 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-400/60 focus:bg-black/30 focus:ring-4 focus:ring-violet-500/10"
              />

              <div className="mt-6 rounded-2xl border border-white/[0.07] bg-black/15 p-4">
                <QuestionCountPicker
                  value={questionCount}
                  onChange={setQuestionCount}
                  disabled={busy}
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="mt-6 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 font-bold text-white shadow-lg shadow-violet-950/40 transition hover:-translate-y-0.5 hover:from-violet-400 hover:to-fuchsia-400 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2 focus:ring-offset-[#13111d] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {busy ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Menyiapkan…
                  </>
                ) : (
                  <>
                    Buat room
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 px-6 sm:px-8">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs font-medium text-zinc-600">
                ATAU
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form
              onSubmit={handleOpen}
              className="p-6 sm:p-8"
            >
              <label
                htmlFor="room-code"
                className="text-sm font-semibold text-zinc-200"
              >
                Masuk dengan kode room
              </label>

              <div className="mt-2 flex gap-2">
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
                  autoComplete="off"
                  placeholder="KODE ROOM"
                  className="h-13 min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 font-mono font-bold uppercase tracking-[0.15em] text-white outline-none transition placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-zinc-600 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10"
                />

                <button
                  type="submit"
                  disabled={busy || roomCode.length < 6}
                  className="min-h-13 rounded-2xl border border-white/10 bg-white/[0.06] px-5 font-bold transition hover:border-violet-400/40 hover:bg-violet-400/10 focus:outline-none focus:ring-2 focus:ring-violet-400/60 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Buka
                </button>
              </div>
            </form>

            <div className="px-6 pb-6 sm:px-8 sm:pb-8">
              <ErrorNotice message={error} />
            </div>
          </section>
        </div>
      </Shell>
    );
  }

  if (!room.you) {
    const roomFull = Boolean(room.players.guest);

    return (
      <Shell>
        <div className="flex min-h-[78svh] items-center justify-center py-10">
          <section className="w-full max-w-xl overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="border-b border-white/10 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-transparent px-6 py-9 text-center sm:px-9">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/10 text-3xl shadow-xl">
                💌
              </div>

              <p className="mt-5 text-xs font-black tracking-[0.2em] text-violet-200">
                UNDANGAN BERMAIN
              </p>

              <h1 className="mt-3 text-3xl font-black">
                {room.players.host.name}
                <span className="block text-zinc-400">
                  mengundangmu
                </span>
              </h1>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2">
                <span className="text-xs text-zinc-500">
                  ROOM
                </span>
                <strong className="font-mono tracking-[0.18em]">
                  {room.code}
                </strong>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {roomFull ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5 text-center">
                  <p className="font-bold text-amber-100">
                    Room sudah penuh
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-100/60">
                    Room ini sudah memiliki dua pemain.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleJoin}>
                  <label
                    htmlFor="join-name"
                    className="text-sm font-semibold text-zinc-200"
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
                    autoComplete="nickname"
                    placeholder="Misalnya: Bima"
                    className="mt-2 h-13 w-full rounded-2xl border border-white/10 bg-black/20 px-4 outline-none transition placeholder:text-zinc-600 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10"
                  />

                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-4 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 font-bold shadow-lg shadow-violet-950/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {busy ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Bergabung…
                      </>
                    ) : (
                      <>
                        Gabung bermain
                        <span aria-hidden="true">→</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <ErrorNotice message={error} />

              <button
                type="button"
                onClick={leaveRoom}
                className="mt-6 w-full text-center text-sm text-zinc-500 transition hover:text-white"
              >
                Bukan room yang kamu cari?
              </button>
            </div>
          </section>
        </div>
      </Shell>
    );
  }

  if (room.status === "waiting") {
    return (
      <Shell>
        <div className="flex min-h-[78svh] items-center justify-center py-10">
          <section className="w-full max-w-xl rounded-[32px] border border-violet-400/20 bg-white/[0.055] p-6 text-center shadow-2xl shadow-violet-950/30 backdrop-blur-2xl sm:p-10">
            <div className="relative mx-auto grid h-24 w-24 place-items-center">
              <div className="absolute inset-0 animate-pulse rounded-full bg-violet-500/15" />
              <div className="relative grid h-16 w-16 place-items-center rounded-3xl border border-violet-300/20 bg-violet-400/15 text-3xl">
                💜
              </div>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              MENUNGGU PASANGAN
            </div>

            <h1 className="mt-6 text-2xl font-black">
              Room sudah siap
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Bagikan tautan atau kode berikut kepada
              pasanganmu.
            </p>

            <div className="mt-7 rounded-3xl border border-dashed border-violet-300/25 bg-violet-400/[0.07] p-6">
              <p className="text-xs font-bold tracking-[0.18em] text-zinc-500">
                KODE ROOM
              </p>

              <p className="mt-3 font-mono text-4xl font-black tracking-[0.2em] text-violet-100 sm:text-5xl">
                {room.code}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void copyInvite()}
              className="mt-6 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 font-bold shadow-lg shadow-violet-950/40 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:opacity-50"
            >
              <span aria-hidden="true">
                {copied ? "✓" : "⧉"}
              </span>
              {copied
                ? "Tautan berhasil disalin"
                : "Salin tautan undangan"}
            </button>

            <p className="mt-5 text-xs text-zinc-600">
              Permainan otomatis dimulai setelah pasanganmu
              bergabung.
            </p>

            <ErrorNotice message={error} />

            <button
              type="button"
              onClick={leaveRoom}
              className="mt-6 text-sm text-zinc-500 transition hover:text-white"
            >
              Keluar dari room
            </button>
          </section>
        </div>
      </Shell>
    );
  }

  const quiz = room.quiz;
  const viewer = room.you;
  const question = quiz.question;
  const guesser = otherPlayer(quiz.subject);
  const subjectName = playerName(room, quiz.subject);
  const guesserName = playerName(room, guesser);
  const hostName = room.players.host.name;
  const guestName = room.players.guest?.name ?? "Pasangan";

  const progress = Math.min(
    100,
    Math.round(
      ((quiz.roundIndex + 1) / quiz.roundCount) * 100,
    ),
  );

  function answerText(answer: number | null) {
    if (answer === null || !question) {
      return "—";
    }

    return question.options[answer] ?? "—";
  }

  const resultMessage =
    quiz.scores.host === quiz.scores.guest
      ? "Kalian sama kuat malam ini."
      : quiz.scores.host > quiz.scores.guest
        ? `${hostName} paling jago menebak malam ini.`
        : `${guestName} paling jago menebak malam ini.`;

  return (
    <Shell>
      <div className="pb-12 pt-7 sm:pt-10">
        <header className="rounded-[28px] border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                <p className="truncate text-xs font-bold tracking-[0.16em] text-zinc-400">
                  ROOM {room.code}
                </p>
              </div>

              <h1 className="mt-2 truncate text-xl font-black sm:text-2xl">
                Seberapa Kenal Kamu?
              </h1>
            </div>

            <button
              type="button"
              onClick={() => void copyInvite()}
              className="shrink-0 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-violet-400/30 hover:bg-violet-400/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-400/60"
            >
              {copied ? "✓ Tersalin" : "⧉ Undang"}
            </button>
          </div>
        </header>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <article
            className={`rounded-3xl border p-4 transition ${
              viewer === "host"
                ? "border-pink-400/30 bg-pink-400/10"
                : "border-white/10 bg-white/[0.04]"
            }`}
          >
            <div className="flex items-center gap-3">
              <PlayerAvatar
                name={hostName}
                active={viewer === "host"}
                tone="pink"
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  {hostName}
                </p>
                <p className="text-xs text-zinc-500">
                  {viewer === "host" ? "Kamu" : "Host"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Poin
              </span>
              <strong className="text-3xl font-black text-pink-300">
                {quiz.scores.host}
              </strong>
            </div>
          </article>

          <article
            className={`rounded-3xl border p-4 transition ${
              viewer === "guest"
                ? "border-violet-400/30 bg-violet-400/10"
                : "border-white/10 bg-white/[0.04]"
            }`}
          >
            <div className="flex items-center gap-3">
              <PlayerAvatar
                name={guestName}
                active={viewer === "guest"}
                tone="violet"
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  {guestName}
                </p>
                <p className="text-xs text-zinc-500">
                  {viewer === "guest"
                    ? "Kamu"
                    : "Pasangan"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Poin
              </span>
              <strong className="text-3xl font-black text-violet-300">
                {quiz.scores.guest}
              </strong>
            </div>
          </article>
        </div>

        <section className="mt-4 overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/30 backdrop-blur-2xl">
          {quiz.phase === "finished" ? (
            <div className="px-6 py-12 text-center sm:px-10 sm:py-16">
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-[32px] border border-violet-300/20 bg-gradient-to-br from-violet-400/20 to-fuchsia-400/10 text-5xl shadow-2xl shadow-violet-950/40">
                💜
              </div>

              <p className="mt-7 text-xs font-black tracking-[0.2em] text-violet-300">
                DATE NIGHT SELESAI
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                {resultMessage}
              </h2>

              <p className="mx-auto mt-4 max-w-md leading-7 text-zinc-400">
                Yang paling penting bukan skornya, tetapi
                cerita baru yang kalian temukan.
              </p>

              <div className="mx-auto mt-8 grid max-w-md grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="rounded-2xl border border-pink-400/20 bg-pink-400/10 p-4">
                  <p className="truncate text-xs text-zinc-400">
                    {hostName}
                  </p>
                  <strong className="mt-1 block text-3xl font-black text-pink-300">
                    {quiz.scores.host}
                  </strong>
                </div>

                <span className="text-sm font-black text-zinc-600">
                  VS
                </span>

                <div className="rounded-2xl border border-violet-400/20 bg-violet-400/10 p-4">
                  <p className="truncate text-xs text-zinc-400">
                    {guestName}
                  </p>
                  <strong className="mt-1 block text-3xl font-black text-violet-300">
                    {quiz.scores.guest}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={leaveRoom}
                className="mt-9 min-h-13 w-full max-w-md rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 font-bold shadow-lg shadow-violet-950/40 transition hover:-translate-y-0.5"
              >
                Pilih game berikutnya
              </button>
            </div>
          ) : (
            <>
              <div className="border-b border-white/10 px-5 py-5 sm:px-8">
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="font-bold text-zinc-300">
                    Pertanyaan {quiz.roundIndex + 1} dari{" "}
                    {quiz.roundCount}
                  </span>

                  <span className="truncate text-right text-violet-300">
                    {quiz.phase === "guesser-answer"
                      ? `${guesserName} menebak`
                      : `${subjectName} menjawab`}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-400 shadow-[0_0_16px_rgba(168,85,247,0.45)] transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-5 sm:p-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-bold text-violet-200">
                  <span aria-hidden="true">✦</span>
                  {quiz.phase === "reveal"
                    ? "HASIL RONDE"
                    : "PILIH SATU JAWABAN"}
                </div>

                <h2 className="mt-5 text-2xl font-black leading-snug text-white sm:text-3xl">
                  {question?.prompt ??
                    "Pertanyaan tidak tersedia."}
                </h2>

                {quiz.phase === "subject-answer" &&
                  (viewer === quiz.subject ? (
                    <>
                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        Jawab sebagai dirimu sendiri. Pilihanmu
                        akan dirahasiakan sampai pasanganmu
                        menebak.
                      </p>

                      <Choices
                        options={question?.options ?? []}
                        disabled={busy}
                        onChoose={(index) =>
                          void performAction(
                            "quiz-submit-subject",
                            index,
                          )
                        }
                      />
                    </>
                  ) : (
                    <div
                      aria-live="polite"
                      className="mt-7 rounded-3xl border border-violet-400/15 bg-violet-400/[0.07] p-6 text-center"
                    >
                      <div className="mx-auto flex w-fit gap-1.5">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-300 [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-300 [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-300" />
                      </div>

                      <p className="mt-4 font-semibold">
                        {subjectName} sedang memilih
                      </p>

                      <p className="mt-2 text-sm text-zinc-500">
                        Jawabannya tetap rahasia untukmu.
                      </p>
                    </div>
                  ))}

                {quiz.phase === "guesser-answer" &&
                  (viewer === guesser ? (
                    <>
                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        Menurutmu, jawaban mana yang dipilih{" "}
                        <strong className="text-violet-200">
                          {subjectName}
                        </strong>
                        ?
                      </p>

                      <Choices
                        options={question?.options ?? []}
                        disabled={busy}
                        onChoose={(index) =>
                          void performAction(
                            "quiz-submit-guess",
                            index,
                          )
                        }
                      />
                    </>
                  ) : (
                    <div
                      aria-live="polite"
                      className="mt-7 rounded-3xl border border-white/10 bg-black/15 p-5"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                        Jawabanmu
                      </p>

                      <p className="mt-3 text-lg font-bold text-violet-100">
                        {answerText(quiz.subjectAnswer)}
                      </p>

                      <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                        <span className="flex gap-1">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300" />
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300 [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300 [animation-delay:300ms]" />
                        </span>

                        <p className="text-sm text-zinc-500">
                          Menunggu {guesserName} menebak…
                        </p>
                      </div>
                    </div>
                  ))}

                {quiz.phase === "reveal" && (
                  <div className="mt-7">
                    <div
                      className={`overflow-hidden rounded-3xl border ${
                        quiz.matched
                          ? "border-emerald-400/25 bg-emerald-400/[0.07]"
                          : "border-amber-400/25 bg-amber-400/[0.07]"
                      }`}
                    >
                      <div className="px-5 py-6 text-center">
                        <div
                          className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl text-2xl ${
                            quiz.matched
                              ? "bg-emerald-400/15"
                              : "bg-amber-400/15"
                          }`}
                        >
                          {quiz.matched ? "💞" : "💭"}
                        </div>

                        <h3
                          className={`mt-4 text-xl font-black ${
                            quiz.matched
                              ? "text-emerald-200"
                              : "text-amber-100"
                          }`}
                        >
                          {quiz.matched
                            ? "Tebakannya cocok!"
                            : "Belum cocok kali ini"}
                        </h3>

                        <p className="mt-2 text-sm text-zinc-500">
                          {quiz.matched
                            ? `${guesserName} mendapat satu poin.`
                            : "Kesempatan bagus untuk saling bercerita."}
                        </p>
                      </div>

                      <div className="grid border-t border-white/10 sm:grid-cols-2">
                        <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-r">
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                            Jawaban {subjectName}
                          </p>
                          <p className="mt-2 font-bold leading-6">
                            {answerText(quiz.subjectAnswer)}
                          </p>
                        </div>

                        <div className="p-5">
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                            Tebakan {guesserName}
                          </p>
                          <p className="mt-2 font-bold leading-6">
                            {answerText(quiz.guessAnswer)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {viewer === "host" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void performAction(
                            "quiz-continue",
                          )
                        }
                        className="mt-6 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 font-bold shadow-lg shadow-violet-950/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        {quiz.roundIndex + 1 ===
                        quiz.roundCount
                          ? "Lihat hasil akhir"
                          : "Pertanyaan berikutnya"}
                        <span aria-hidden="true">→</span>
                      </button>
                    ) : (
                      <div
                        aria-live="polite"
                        className="mt-5 rounded-2xl bg-white/[0.035] px-4 py-3 text-center text-sm text-zinc-500"
                      >
                        Menunggu host melanjutkan…
                      </div>
                    )}
                  </div>
                )}

                <ErrorNotice message={error} />
              </div>
            </>
          )}
        </section>
      </div>
    </Shell>
  );
}