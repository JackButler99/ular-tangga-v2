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

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#090812] px-5 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← Kembali ke katalog
        </Link>

        {children}
      </div>
    </main>
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
  return (
    <div className="mt-7 grid gap-3">
      {options.map((option, index) => (
        <button
          type="button"
          key={option}
          disabled={disabled}
          onClick={() => onChoose(index)}
          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:border-violet-400/50 hover:bg-violet-400/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {option}
        </button>
      ))}
    </div>
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

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    void createRoom(name);
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
        <p className="mt-20 text-center text-zinc-400">
          Membuka room…
        </p>
      </Shell>
    );
  }

  if (!room) {
    return (
      <Shell>
        <header className="mt-12">
          <p className="text-xs font-bold tracking-[0.2em] text-violet-400">
            SEBERAPA KENAL KAMU?
          </p>

          <h1 className="mt-4 text-4xl font-bold">
            Tebak pilihan dia.
          </h1>

          <p className="mt-3 text-zinc-400">
            Buat room dan undang pasanganmu dari perangkat
            lain.
          </p>
        </header>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
          <form onSubmit={handleCreate}>
            <label
              htmlFor="create-name"
              className="text-sm text-zinc-300"
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
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400"
            />

            <button
              type="submit"
              disabled={busy}
              className="mt-4 w-full rounded-full bg-violet-500 px-5 py-3 font-semibold hover:bg-violet-400 disabled:opacity-50"
            >
              {busy ? "Menyiapkan…" : "Buat room"}
            </button>
          </form>

          <div className="my-7 border-t border-white/10" />

          <form onSubmit={handleOpen}>
            <label
              htmlFor="room-code"
              className="text-sm text-zinc-300"
            >
              Sudah punya kode?
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
                placeholder="KODE ROOM"
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 uppercase outline-none focus:border-violet-400"
              />

              <button
                type="submit"
                disabled={busy || roomCode.length < 6}
                className="rounded-2xl border border-white/10 px-5 font-semibold disabled:opacity-50"
              >
                Buka
              </button>
            </div>
          </form>

          {error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}
        </section>
      </Shell>
    );
  }

  if (!room.you) {
    const roomFull = Boolean(room.players.guest);

    return (
      <Shell>
        <section className="mt-14 rounded-3xl border border-white/10 bg-white/5 p-7 text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-violet-400">
            UNDANGAN BERMAIN
          </p>

          <h1 className="mt-4 text-3xl font-bold">
            {room.players.host.name} mengundangmu.
          </h1>

          <p className="mt-3 text-zinc-400">
            Room <strong>{room.code}</strong>
          </p>

          {roomFull ? (
            <p className="mt-8 rounded-2xl bg-white/5 p-4 text-zinc-400">
              Room ini sudah memiliki dua pemain.
            </p>
          ) : (
            <form
              onSubmit={handleJoin}
              className="mt-8 text-left"
            >
              <label
                htmlFor="join-name"
                className="text-sm text-zinc-300"
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
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-400"
              />

              <button
                type="submit"
                disabled={busy}
                className="mt-4 w-full rounded-full bg-violet-500 px-5 py-3 font-semibold disabled:opacity-50"
              >
                {busy ? "Bergabung…" : "Gabung bermain"}
              </button>
            </form>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={leaveRoom}
            className="mt-6 text-sm text-zinc-500 hover:text-white"
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
        <section className="mt-14 rounded-3xl border border-violet-400/20 bg-violet-400/10 p-8 text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-violet-300">
            ROOM SIAP
          </p>

          <h1 className="mt-5 text-4xl font-bold tracking-widest">
            {room.code}
          </h1>

          <p className="mt-4 text-zinc-400">
            Bagikan tautan ini kepada pasanganmu.
          </p>

          <button
            type="button"
            onClick={() => void copyInvite()}
            className="mt-7 rounded-full bg-violet-500 px-6 py-3 font-semibold"
          >
            {copied ? "Tautan tersalin!" : "Salin undangan"}
          </button>

          <button
            type="button"
            onClick={leaveRoom}
            className="mt-5 block w-full text-sm text-zinc-500"
          >
            Keluar dari room
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}
        </section>
      </Shell>
    );
  }

  const quiz = room.quiz;
  const viewer = room.you;
  const guesser = otherPlayer(quiz.subject);
  const subjectName = playerName(room, quiz.subject);
  const guesserName = playerName(room, guesser);

  const answerText = (answer: number | null) =>
    answer === null
      ? "—"
      : quiz.question.options[answer] ?? "—";

  return (
    <Shell>
      <header className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-violet-400">
              ROOM {room.code}
            </p>
            <h1 className="mt-3 text-3xl font-bold">
              Seberapa Kenal Kamu?
            </h1>
          </div>

          <button
            type="button"
            onClick={() => void copyInvite()}
            className="rounded-full border border-white/10 px-4 py-2 text-xs text-zinc-400"
          >
            {copied ? "Tersalin" : "Undang"}
          </button>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <article className="rounded-2xl border border-pink-400/20 bg-pink-400/10 p-4">
            <span className="text-xs text-zinc-400">
              {room.players.host.name}
            </span>
            <strong className="mt-2 block text-2xl">
              {quiz.scores.host}
            </strong>
          </article>

          <article className="rounded-2xl border border-violet-400/20 bg-violet-400/10 p-4">
            <span className="text-xs text-zinc-400">
              {room.players.guest?.name}
            </span>
            <strong className="mt-2 block text-2xl">
              {quiz.scores.guest}
            </strong>
          </article>
        </div>
      </header>

      <section className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        {quiz.phase === "finished" ? (
          <div className="py-8 text-center">
            <span className="text-5xl">♥</span>
            <h2 className="mt-6 text-3xl font-bold">
              Permainan selesai!
            </h2>
            <p className="mt-3 text-zinc-400">
              {room.players.host.name} {quiz.scores.host} —{" "}
              {quiz.scores.guest} {room.players.guest?.name}
            </p>

            <button
              type="button"
              onClick={leaveRoom}
              className="mt-8 rounded-full bg-violet-500 px-6 py-3 font-semibold"
            >
              Kembali ke awal
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>
                Ronde {quiz.roundIndex + 1}/{quiz.roundCount}
              </span>
              <span>
                Giliran {quiz.phase === "guesser-answer"
                  ? guesserName
                  : subjectName}
              </span>
            </div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-violet-500"
                style={{
                  width: `${
                    ((quiz.roundIndex + 1) /
                      quiz.roundCount) *
                    100
                  }%`,
                }}
              />
            </div>

            <h2 className="mt-7 text-2xl font-bold">
              {quiz.question.prompt}
            </h2>

            {quiz.phase === "subject-answer" &&
              (viewer === quiz.subject ? (
                <>
                  <p className="mt-3 text-sm text-violet-300">
                    {subjectName}, pilih jawabanmu secara
                    rahasia.
                  </p>

                  <Choices
                    options={quiz.question.options}
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
                <p className="mt-7 rounded-2xl bg-white/5 p-5 text-zinc-400">
                  Menunggu {subjectName} memilih jawaban…
                </p>
              ))}

            {quiz.phase === "guesser-answer" &&
              (viewer === guesser ? (
                <>
                  <p className="mt-3 text-sm text-violet-300">
                    Tebak jawaban {subjectName}.
                  </p>

                  <Choices
                    options={quiz.question.options}
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
                <div className="mt-7 rounded-2xl bg-white/5 p-5">
                  <p className="text-sm text-zinc-400">
                    Jawabanmu
                  </p>
                  <strong className="mt-2 block">
                    {answerText(quiz.subjectAnswer)}
                  </strong>
                  <p className="mt-4 text-sm text-zinc-500">
                    Menunggu {guesserName} menebak…
                  </p>
                </div>
              ))}

            {quiz.phase === "reveal" && (
              <div className="mt-7">
                <div
                  className={`rounded-2xl border p-5 ${
                    quiz.matched
                      ? "border-emerald-400/30 bg-emerald-400/10"
                      : "border-orange-400/30 bg-orange-400/10"
                  }`}
                >
                  <strong className="text-lg">
                    {quiz.matched
                      ? "Tebakannya cocok!"
                      : "Belum cocok kali ini."}
                  </strong>

                  <p className="mt-5 text-sm text-zinc-400">
                    Jawaban {subjectName}
                  </p>
                  <p className="mt-1 font-semibold">
                    {answerText(quiz.subjectAnswer)}
                  </p>

                  <p className="mt-4 text-sm text-zinc-400">
                    Tebakan {guesserName}
                  </p>
                  <p className="mt-1 font-semibold">
                    {answerText(quiz.guessAnswer)}
                  </p>
                </div>

                {viewer === "host" ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void performAction("quiz-continue")
                    }
                    className="mt-6 w-full rounded-full bg-violet-500 px-6 py-3 font-semibold disabled:opacity-50"
                  >
                    {quiz.roundIndex + 1 === quiz.roundCount
                      ? "Lihat hasil"
                      : "Ronde berikutnya"}
                  </button>
                ) : (
                  <p className="mt-5 text-center text-sm text-zinc-500">
                    Menunggu host melanjutkan ronde…
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {error && (
          <p className="mt-5 text-sm text-red-400">
            {error}
          </p>
        )}
      </section>
    </Shell>
  );
}