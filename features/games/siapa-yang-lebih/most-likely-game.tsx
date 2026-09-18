"use client";

import Link from "next/link";
import {
  type FormEvent,
  type ReactNode,
  useState,
} from "react";

import type { MostLikelyRoomView } from "@/features/games/siapa-yang-lebih/room-view";
import { useMostLikelyRoom } from "@/features/games/siapa-yang-lebih/use-most-likely-room";
import type { PlayerRole } from "@/features/platform/room/types";

function playerName(
  room: MostLikelyRoomView,
  role: PlayerRole,
) {
  return role === "host"
    ? room.players.host
    : room.players.guest ?? "Pasangan";
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

function PlayerChoices({
  room,
  disabled,
  onChoose,
}: {
  room: MostLikelyRoomView;
  disabled: boolean;
  onChoose: (role: PlayerRole) => void;
}) {
  const roles: PlayerRole[] = ["host", "guest"];

  return (
    <div className="mt-7 grid gap-3 sm:grid-cols-2">
      {roles.map((role) => (
        <button
          type="button"
          key={role}
          disabled={disabled}
          onClick={() => onChoose(role)}
          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-5 text-left transition hover:border-pink-400/50 hover:bg-pink-400/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-xs uppercase tracking-widest text-zinc-500">
            Pilih
          </span>

          <strong className="mt-2 block text-lg">
            {playerName(room, role)}
          </strong>
        </button>
      ))}
    </div>
  );
}

export default function MostLikelyGame() {
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
  } = useMostLikelyRoom();

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
          <p className="text-xs font-bold tracking-[0.2em] text-pink-400">
            SIAPA YANG LEBIH?
          </p>

          <h1 className="mt-4 text-4xl font-bold">
            Bandingkan jawaban kalian.
          </h1>

          <p className="mt-3 text-zinc-400">
            Pilih diam-diam siapa yang paling sesuai dengan
            setiap pertanyaan.
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
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-pink-400"
            />

            <button
              type="submit"
              disabled={busy}
              className="mt-4 w-full rounded-full bg-pink-500 px-5 py-3 font-semibold hover:bg-pink-400 disabled:opacity-50"
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
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 uppercase outline-none focus:border-pink-400"
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
          <p className="text-xs font-bold tracking-[0.2em] text-pink-400">
            UNDANGAN BERMAIN
          </p>

          <h1 className="mt-4 text-3xl font-bold">
            {room.players.host} mengundangmu.
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
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-pink-400"
              />

              <button
                type="submit"
                disabled={busy}
                className="mt-4 w-full rounded-full bg-pink-500 px-5 py-3 font-semibold disabled:opacity-50"
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
        <section className="mt-14 rounded-3xl border border-pink-400/20 bg-pink-400/10 p-8 text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-pink-300">
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
            className="mt-7 rounded-full bg-pink-500 px-6 py-3 font-semibold"
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

  const game = room.game;
  const viewer = room.you;

  const hostAnswered =
    game.phase !== "answering" ||
    (viewer === "host"
      ? game.yourAnswer !== null
      : game.partnerAnswered);

  const guestAnswered =
    game.phase !== "answering" ||
    (viewer === "guest"
      ? game.yourAnswer !== null
      : game.partnerAnswered);

  const hostAnswer =
    game.revealedAnswers?.host ?? null;

  const guestAnswer =
    game.revealedAnswers?.guest ?? null;

  const matched =
    hostAnswer !== null &&
    guestAnswer !== null &&
    hostAnswer === guestAnswer;

  const agreementRate = Math.round(
    (game.agreementCount / game.totalRounds) * 100,
  );

  return (
    <Shell>
      <header className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-pink-400">
              ROOM {room.code}
            </p>

            <h1 className="mt-3 text-3xl font-bold">
              Siapa yang Lebih?
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
            <span className="text-sm">
              {room.players.host}
            </span>

            <strong className="mt-2 block text-xs text-zinc-400">
              {hostAnswered
                ? "Sudah memilih"
                : "Sedang memilih…"}
            </strong>
          </article>

          <article className="rounded-2xl border border-violet-400/20 bg-violet-400/10 p-4">
            <span className="text-sm">
              {room.players.guest}
            </span>

            <strong className="mt-2 block text-xs text-zinc-400">
              {guestAnswered
                ? "Sudah memilih"
                : "Sedang memilih…"}
            </strong>
          </article>
        </div>
      </header>

      <section className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        {game.phase === "finished" ? (
          <div className="py-8 text-center">
            <span className="text-5xl">♥</span>

            <h2 className="mt-6 text-3xl font-bold">
              Permainan selesai!
            </h2>

            <p className="mt-3 text-zinc-400">
              Jawaban kalian cocok pada{" "}
              <strong className="text-white">
                {game.agreementCount} dari{" "}
                {game.totalRounds} ronde
              </strong>
              .
            </p>

            <p className="mt-4 text-5xl font-bold text-pink-400">
              {agreementRate}%
            </p>

            <button
              type="button"
              onClick={leaveRoom}
              className="mt-8 rounded-full bg-pink-500 px-6 py-3 font-semibold"
            >
              Kembali ke awal
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>
                Ronde {game.round}/{game.totalRounds}
              </span>

              <span>
                Cocok {game.agreementCount} kali
              </span>
            </div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-pink-500"
                style={{
                  width: `${
                    (game.round / game.totalRounds) * 100
                  }%`,
                }}
              />
            </div>

            <h2 className="mt-7 text-2xl font-bold">
              {game.question?.text ??
                "Pertanyaan tidak tersedia."}
            </h2>

            {game.phase === "answering" &&
              (game.yourAnswer === null ? (
                <>
                  <p className="mt-3 text-sm text-pink-300">
                    Pilih jawabanmu secara rahasia.
                  </p>

                  <PlayerChoices
                    room={room}
                    disabled={busy}
                    onChoose={(answer) =>
                      void performAction(
                        "most-likely-answer",
                        answer,
                      )
                    }
                  />
                </>
              ) : (
                <div className="mt-7 rounded-2xl bg-white/5 p-5">
                  <p className="text-sm text-zinc-400">
                    Pilihanmu
                  </p>

                  <strong className="mt-2 block text-lg">
                    {playerName(room, game.yourAnswer)}
                  </strong>

                  <p className="mt-4 text-sm text-zinc-500">
                    {game.partnerAnswered
                      ? "Membuka hasil…"
                      : "Menunggu pasanganmu memilih…"}
                  </p>
                </div>
              ))}

            {game.phase === "reveal" && (
              <div className="mt-7">
                <div
                  className={`rounded-2xl border p-5 ${
                    matched
                      ? "border-emerald-400/30 bg-emerald-400/10"
                      : "border-orange-400/30 bg-orange-400/10"
                  }`}
                >
                  <strong className="text-lg">
                    {matched
                      ? "Kalian sepakat!"
                      : "Jawaban kalian berbeda."}
                  </strong>

                  <p className="mt-5 text-sm text-zinc-400">
                    Pilihan {room.players.host}
                  </p>

                  <p className="mt-1 font-semibold">
                    {hostAnswer
                      ? playerName(room, hostAnswer)
                      : "—"}
                  </p>

                  <p className="mt-4 text-sm text-zinc-400">
                    Pilihan {room.players.guest}
                  </p>

                  <p className="mt-1 font-semibold">
                    {guestAnswer
                      ? playerName(room, guestAnswer)
                      : "—"}
                  </p>
                </div>

                {viewer === "host" ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void performAction(
                        "most-likely-continue",
                      )
                    }
                    className="mt-6 w-full rounded-full bg-pink-500 px-6 py-3 font-semibold disabled:opacity-50"
                  >
                    {game.round === game.totalRounds
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