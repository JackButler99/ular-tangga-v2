"use client";

import Link from "next/link";
import {
  type FormEvent,
  type ReactNode,
  useState,
} from "react";

import {
  cryptogramLanguageLabel,
  type CryptogramLanguage,
} from "@/features/games/cryptogram-cinta/content";
import { LoveLevelCutscene } from "@/features/games/cryptogram-cinta/love-level-cutscene";
import type { CryptogramRoomView } from "@/features/games/cryptogram-cinta/room-view";
import { useCryptogramRoom } from "@/features/games/cryptogram-cinta/use-cryptogram-room";
import type { PlayerRole } from "@/features/platform/room/types";

const ALPHABET = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#070914] px-4 py-5 text-white sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute -left-32 -top-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-36 top-1/4 h-96 w-96 rounded-full bg-violet-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-rose-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative mx-auto w-full max-w-5xl">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-4 text-sm font-medium text-zinc-300 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[.08] hover:text-white"
        >
          <span aria-hidden="true">←</span>
          Kembali ke katalog
        </Link>
        {children}
      </div>
    </main>
  );
}

function ErrorNotice({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-200"
    >
      {message}
    </div>
  );
}

function LoadingScreen() {
  return (
    <Shell>
      <div className="flex min-h-[75svh] flex-col items-center justify-center text-center">
        <div className="relative grid h-20 w-20 place-items-center">
          <div className="absolute inset-0 animate-ping rounded-3xl bg-cyan-400/10" />
          <div className="relative grid h-16 w-16 place-items-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10 text-3xl">
            🔐
          </div>
        </div>
        <p className="mt-6 font-bold">Menyusun alfabet rahasia…</p>
      </div>
    </Shell>
  );
}

function playerName(room: CryptogramRoomView, role: PlayerRole) {
  return role === "host"
    ? room.players.host.name
    : room.players.guest?.name ?? "Pasangan";
}

function otherRole(role: PlayerRole): PlayerRole {
  return role === "host" ? "guest" : "host";
}

function PlayerCard({
  name,
  label,
  contribution,
  tone,
}: {
  name: string;
  label: string;
  contribution: number;
  tone: "rose" | "violet";
}) {
  const toneClasses =
    tone === "rose"
      ? "border-rose-400/20 bg-rose-400/[.08] text-rose-200"
      : "border-violet-400/20 bg-violet-400/[.08] text-violet-200";

  return (
    <article className={`rounded-3xl border p-4 ${toneClasses}`}>
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black/20 text-lg font-black">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold text-white">{name}</p>
          <p className="text-xs opacity-65">{label}</p>
        </div>
        <strong className="ml-auto text-2xl font-black">
          {contribution}
        </strong>
      </div>
    </article>
  );
}

function CipherBoard({
  cipherText,
  mappings,
  selectedCipher,
  disabled,
  onSelect,
}: {
  cipherText: string;
  mappings: Record<string, string>;
  selectedCipher: string;
  disabled: boolean;
  onSelect: (letter: string) => void;
}) {
  return (
    <div
      className="flex flex-wrap justify-center gap-x-4 gap-y-5"
      aria-label="Kutipan dalam sandi"
    >
      {cipherText.split(" ").map((word, wordIndex) => (
        <span
          key={`${word}-${wordIndex}`}
          className="inline-flex gap-1"
        >
          {Array.from(word).map((character, characterIndex) => {
            if (!/[A-Z]/.test(character)) {
              return (
                <span
                  key={`${character}-${characterIndex}`}
                  className="flex h-14 items-end px-0.5 pb-1 text-lg text-zinc-500"
                >
                  {character}
                </span>
              );
            }

            const decoded = mappings[character];
            const selected = selectedCipher === character;

            return (
              <button
                type="button"
                key={`${character}-${characterIndex}`}
                disabled={disabled || Boolean(decoded)}
                onClick={() => onSelect(character)}
                aria-label={
                  decoded
                    ? `${character} berarti ${decoded}`
                    : `Pilih huruf sandi ${character}`
                }
                className={`grid h-14 w-8 grid-rows-[1fr_auto] rounded-xl border px-1 py-1.5 font-mono transition sm:w-9 ${
                  decoded
                    ? "border-emerald-400/20 bg-emerald-400/[.08]"
                    : selected
                      ? "-translate-y-1 border-cyan-300 bg-cyan-300/15 shadow-lg shadow-cyan-950/50"
                      : "border-white/10 bg-black/20 hover:border-cyan-300/40 hover:bg-cyan-300/[.06]"
                }`}
              >
                <strong
                  className={`self-center text-lg ${
                    decoded ? "text-emerald-200" : "text-zinc-600"
                  }`}
                >
                  {decoded ?? "·"}
                </strong>
                <span className="border-t border-white/10 pt-0.5 text-[10px] font-bold text-cyan-200">
                  {character}
                </span>
              </button>
            );
          })}
        </span>
      ))}
    </div>
  );
}

function AlphabetPicker({
  selectedCipher,
  mappings,
  disabled,
  onGuess,
}: {
  selectedCipher: string;
  mappings: Record<string, string>;
  disabled: boolean;
  onGuess: (plainLetter: string) => void;
}) {
  const usedLetters = new Set(Object.values(mappings));

  return (
    <div className="mt-7">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black tracking-[.16em] text-zinc-500">
          PILIH ARTI HURUF
        </p>
        <p className="text-sm text-cyan-200">
          {selectedCipher ? (
            <>
              Sandi <strong>{selectedCipher}</strong> berarti…
            </>
          ) : (
            "Pilih huruf pada kutipan dahulu"
          )}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2 sm:grid-cols-[repeat(13,minmax(0,1fr))]">
        {ALPHABET.map((letter) => (
          <button
            type="button"
            key={letter}
            disabled={
              disabled ||
              !selectedCipher ||
              usedLetters.has(letter)
            }
            onClick={() => onGuess(letter)}
            className="aspect-square rounded-xl border border-white/10 bg-white/[.04] font-mono text-sm font-black text-zinc-200 transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-20 disabled:hover:translate-y-0"
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CryptogramGame() {
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
  } = useCryptogramRoom();
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [language, setLanguage] =
    useState<CryptogramLanguage>("id");
  const [selectedCipher, setSelectedCipher] = useState("");

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    void createRoom(name, language);
  }

  function handleOpen(event: FormEvent) {
    event.preventDefault();
    void openRoom(roomCode);
  }

  function handleJoin(event: FormEvent) {
    event.preventDefault();
    void joinRoom(name);
  }

  if (booting) return <LoadingScreen />;

  if (!room) {
    return (
      <Shell>
        <div className="pb-12 pt-10 sm:pt-16">
          <header className="mx-auto max-w-3xl text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] border border-cyan-300/20 bg-gradient-to-br from-cyan-400/20 to-violet-500/10 text-4xl shadow-2xl shadow-cyan-950/30">
              🔐
            </div>
            <p className="mt-7 text-xs font-black tracking-[.24em] text-cyan-300">
              SURVIVAL PUZZLE UNTUK BERDUA
            </p>
            <h1 className="mt-4 bg-gradient-to-r from-white via-cyan-100 to-rose-200 bg-clip-text text-4xl font-black text-transparent sm:text-6xl">
              Cryptogram Cinta
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              Pecahkan alfabet rahasia bersama. Setiap tebakan benar membuka
              isi kutipan cinta; setiap tebakan salah melukai Hati Sandi kalian.
            </p>
          </header>

          <section className="mx-auto mt-9 grid max-w-3xl gap-3 sm:grid-cols-4">
            {[
              ["1–2", "Mudah", "4 huruf terbuka"],
              ["3–5", "Sedang", "3 huruf terbuka"],
              ["6–8", "Sulit", "1 huruf terbuka"],
              ["9+", "Legenda", "Tanpa bantuan"],
            ].map(([levels, label, detail]) => (
              <article
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[.04] p-4 text-left"
              >
                <p className="text-xs font-bold text-cyan-300">LEVEL {levels}</p>
                <h2 className="mt-2 font-black">{label}</h2>
                <p className="mt-1 text-xs text-zinc-500">{detail}</p>
              </article>
            ))}
          </section>

          <section className="mx-auto mt-7 max-w-2xl overflow-hidden rounded-[32px] border border-white/10 bg-white/[.055] shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <form onSubmit={handleCreate} className="p-6 sm:p-8">
              <p className="text-xs font-black tracking-[.18em] text-cyan-300">
                BUAT RUANG BERTAHAN
              </p>
              <fieldset className="mt-5">
                <legend className="text-sm font-semibold">
                  Bahasa kutipan
                </legend>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Pilihan ini berlaku untuk kedua pemain selama satu
                  perjalanan.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {(
                    [
                      ["id", "🇮🇩", "Bahasa Indonesia"],
                      ["en", "🇬🇧", "English"],
                    ] as const
                  ).map(([value, flag, label]) => {
                    const selected = language === value;

                    return (
                      <button
                        type="button"
                        key={value}
                        aria-pressed={selected}
                        onClick={() => setLanguage(value)}
                        className={`min-h-20 rounded-2xl border px-4 py-3 text-left transition ${
                          selected
                            ? "border-cyan-300/60 bg-cyan-300/10 shadow-lg shadow-cyan-950/20"
                            : "border-white/10 bg-black/20 hover:border-white/20"
                        }`}
                      >
                        <span className="text-xl" aria-hidden="true">
                          {flag}
                        </span>
                        <span className="mt-1 block text-sm font-black text-white">
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <label htmlFor="cryptogram-name" className="mt-5 block text-sm font-semibold">
                Nama panggilanmu
              </label>
              <input
                id="cryptogram-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={20}
                required
                autoComplete="nickname"
                placeholder="Misalnya: Ara"
                className="mt-2 h-13 w-full rounded-2xl border border-white/10 bg-black/20 px-4 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/10"
              />
              <button
                type="submit"
                disabled={busy}
                className="mt-5 min-h-13 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 font-black shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {busy ? "Menyiapkan sandi…" : "Buat room Cryptogram"}
              </button>
            </form>

            <div className="flex items-center gap-3 px-6 sm:px-8">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-zinc-600">ATAU MASUK</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleOpen} className="p-6 sm:p-8">
              <label htmlFor="cryptogram-code" className="text-sm font-semibold">
                Kode room pasangan
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="cryptogram-code"
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
                  className="h-13 min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 font-mono font-black tracking-[.14em] outline-none placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-zinc-600 focus:border-cyan-300/60"
                />
                <button
                  type="submit"
                  disabled={busy || roomCode.length < 6}
                  className="rounded-2xl border border-white/10 bg-white/[.06] px-5 font-bold transition hover:border-cyan-300/40 hover:bg-cyan-300/10 disabled:opacity-40"
                >
                  Buka
                </button>
              </div>
              <ErrorNotice message={error} />
            </form>
          </section>

          <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-zinc-600">
            Semua soal memakai kutipan asli dengan nama karya dan pencipta.
            Tidak ada kutipan atau parafrasa buatan.
          </p>
        </div>
      </Shell>
    );
  }

  if (!room.you) {
    const roomFull = Boolean(room.players.guest);

    return (
      <Shell>
        <div className="flex min-h-[78svh] items-center justify-center py-10">
          <section className="w-full max-w-xl rounded-[32px] border border-white/10 bg-white/[.055] p-6 text-center shadow-2xl shadow-black/30 sm:p-9">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10 text-3xl">
              💌
            </div>
            <p className="mt-5 text-xs font-black tracking-[.2em] text-cyan-300">
              UNDANGAN MEMECAHKAN SANDI
            </p>
            <h1 className="mt-3 text-3xl font-black">
              {room.players.host.name} mengundangmu
            </h1>
            <p className="mt-3 font-mono text-xl tracking-[.18em] text-zinc-400">
              {room.code}
            </p>
            <p className="mx-auto mt-3 w-fit rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-200">
              Kutipan · {cryptogramLanguageLabel(room.cryptogram.language)}
            </p>

            {roomFull ? (
              <p className="mt-7 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-amber-100">
                Room ini sudah memiliki dua pemain.
              </p>
            ) : (
              <form onSubmit={handleJoin} className="mt-7 text-left">
                <label htmlFor="cryptogram-join-name" className="text-sm font-semibold">
                  Nama panggilanmu
                </label>
                <input
                  id="cryptogram-join-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={2}
                  maxLength={20}
                  required
                  placeholder="Misalnya: Bima"
                  className="mt-2 h-13 w-full rounded-2xl border border-white/10 bg-black/20 px-4 outline-none focus:border-cyan-300/60"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-4 min-h-13 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 text-center font-black disabled:opacity-50"
                >
                  {busy ? "Bergabung…" : "Gabung dan pecahkan bersama"}
                </button>
              </form>
            )}
            <ErrorNotice message={error} />
            <button type="button" onClick={leaveRoom} className="mt-6 text-sm text-zinc-500 hover:text-white">
              Bukan room yang kamu cari?
            </button>
          </section>
        </div>
      </Shell>
    );
  }

  if (room.status === "waiting") {
    return (
      <Shell>
        <div className="flex min-h-[78svh] items-center justify-center py-10">
          <section className="w-full max-w-xl rounded-[32px] border border-cyan-300/20 bg-white/[.055] p-7 text-center shadow-2xl shadow-cyan-950/20 sm:p-10">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10 text-4xl">
              🔐
            </div>
            <p className="mt-6 text-xs font-black tracking-[.2em] text-cyan-300">
              MENUNGGU PARTNER SANDI
            </p>
            <h1 className="mt-3 text-2xl font-black">Room sudah siap</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Kutipan akan menggunakan {cryptogramLanguageLabel(room.cryptogram.language)}.
            </p>
            <div className="mt-6 rounded-3xl border border-dashed border-cyan-300/25 bg-cyan-300/[.06] p-6">
              <p className="text-xs font-bold text-zinc-500">KODE ROOM</p>
              <p className="mt-3 font-mono text-4xl font-black tracking-[.18em] text-cyan-100">
                {room.code}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void copyInvite()}
              className="mt-6 min-h-13 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 font-black"
            >
              {copied ? "✓ Tautan tersalin" : "Salin tautan undangan"}
            </button>
            <ErrorNotice message={error} />
            <button type="button" onClick={leaveRoom} className="mt-6 text-sm text-zinc-500 hover:text-white">
              Keluar dari room
            </button>
          </section>
        </div>
      </Shell>
    );
  }

  const game = room.cryptogram;
  const viewer = room.you;
  const hostName = room.players.host.name;
  const guestName = room.players.guest?.name ?? "Pasangan";
  const lastActor = game.lastEvent
    ? playerName(room, game.lastEvent.role)
    : null;

  if (game.phase === "finished") {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl pb-12 pt-10 text-center">
          <section className="rounded-[36px] border border-rose-400/20 bg-gradient-to-b from-rose-400/10 to-white/[.03] p-7 shadow-2xl shadow-rose-950/25 sm:p-12">
            <div className="text-6xl">💔</div>
            <p className="mt-6 text-xs font-black tracking-[.22em] text-rose-300">
              HATI SANDI HABIS
            </p>
            <h1 className="mt-3 text-4xl font-black">
              Kalian bertahan {game.solvedLevels} level.
            </h1>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-zinc-400">
              Jawaban terakhir terbuka. Tarik napas, baca maknanya bersama,
              lalu coba pecahkan lebih jauh pada perjalanan berikutnya.
            </p>

            {game.quote && (
              <blockquote className="mx-auto mt-8 max-w-2xl rounded-3xl border border-white/10 bg-black/20 p-6">
                <p className="font-serif text-xl leading-8 text-rose-50">
                  “{game.quote.text}”
                </p>
                <footer className="mt-3 text-xs text-zinc-500">
                  {game.quote.source}
                </footer>
                <a
                  href={game.quote.referenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-xs font-bold text-rose-300 underline decoration-rose-300/30 underline-offset-4 hover:text-rose-200"
                >
                  Lihat sumber kutipan ↗
                </a>
              </blockquote>
            )}

            <div className="mx-auto mt-7 grid max-w-lg grid-cols-2 gap-3">
              <PlayerCard
                name={hostName}
                label="Huruf ditemukan"
                contribution={game.contributions.host}
                tone="rose"
              />
              <PlayerCard
                name={guestName}
                label="Huruf ditemukan"
                contribution={game.contributions.guest}
                tone="violet"
              />
            </div>

            {viewer === "host" ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void performAction("cryptogram-restart")}
                className="mt-8 min-h-13 w-full max-w-lg rounded-2xl bg-gradient-to-r from-rose-500 to-violet-500 px-6 font-black disabled:opacity-50"
              >
                Mulai perjalanan baru
              </button>
            ) : (
              <p className="mt-8 text-sm text-zinc-500">
                Menunggu {hostName} memulai perjalanan baru…
              </p>
            )}
            <button type="button" onClick={leaveRoom} className="mt-5 block w-full text-sm text-zinc-500 hover:text-white">
              Kembali ke katalog game
            </button>
            <ErrorNotice message={error} />
          </section>
        </div>
      </Shell>
    );
  }

  const viewerReady = game.readyPlayers.includes(viewer);
  const partnerReady = game.readyPlayers.includes(otherRole(viewer));

  return (
    <Shell>
      {game.phase === "level-complete" && game.quote && (
        <LoveLevelCutscene
          hostName={hostName}
          guestName={guestName}
          level={game.level}
          quote={game.quote.text}
          source={game.quote.source}
          sourceUrl={game.quote.referenceUrl}
          viewerReady={viewerReady}
          partnerReady={partnerReady}
          busy={busy}
          onContinue={() => void performAction("cryptogram-ready")}
        />
      )}

      <div className="pb-12 pt-7">
        <header className="rounded-[28px] border border-white/10 bg-white/[.045] p-4 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black tracking-[.18em] text-cyan-300">
                ROOM {room.code} · LEVEL {game.level}
              </p>
              <h1 className="mt-2 text-2xl font-black">Cryptogram Cinta</h1>
            </div>
            <button
              type="button"
              onClick={() => void copyInvite()}
              className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-2 text-xs font-bold text-zinc-300 hover:border-cyan-300/30 hover:text-white"
            >
              {copied ? "✓ Tersalin" : "⧉ Undang"}
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Makna ditemukan</span>
                <strong className="text-cyan-200">{game.progress}%</strong>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 transition-all duration-500"
                  style={{ width: `${game.progress}%` }}
                />
              </div>
            </div>
            <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-bold text-violet-200">
              {game.difficulty.label}
            </span>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-200">
              {game.language === "id" ? "ID" : "EN"}
            </span>
            <span className="rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-xs font-bold text-rose-200">
              {Array.from({ length: game.difficulty.maxMistakes }, (_, index) =>
                index < game.remainingMistakes ? "♥" : "♡",
              ).join(" ")}
            </span>
          </div>
        </header>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <PlayerCard
            name={hostName}
            label={viewer === "host" ? "Kamu · huruf benar" : "Host · huruf benar"}
            contribution={game.contributions.host}
            tone="rose"
          />
          <PlayerCard
            name={guestName}
            label={viewer === "guest" ? "Kamu · huruf benar" : "Pasangan · huruf benar"}
            contribution={game.contributions.guest}
            tone="violet"
          />
        </div>

        <section className="mt-4 overflow-hidden rounded-[32px] border border-white/10 bg-white/[.055] shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="border-b border-white/10 px-5 py-4 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-black tracking-[.16em] text-zinc-500">
                KUTIPAN TERENKRIPSI
              </p>
              <p className="text-xs text-zinc-500">
                Huruf bawah = sandi · huruf atas = arti
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <CipherBoard
              cipherText={game.cipherText}
              mappings={game.knownMappings}
              selectedCipher={selectedCipher}
              disabled={busy || game.phase !== "playing"}
              onSelect={setSelectedCipher}
            />

            <AlphabetPicker
              selectedCipher={selectedCipher}
              mappings={game.knownMappings}
              disabled={busy || game.phase !== "playing"}
              onGuess={(plainLetter) => {
                const cipherLetter = selectedCipher;
                setSelectedCipher("");
                void performAction("cryptogram-guess", {
                  cipherLetter,
                  plainLetter,
                });
              }}
            />

            {lastActor && game.lastEvent && (
              <div
                aria-live="polite"
                className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
                  game.lastEvent.kind === "wrong"
                    ? "border-amber-300/20 bg-amber-300/[.08] text-amber-100"
                    : "border-emerald-300/20 bg-emerald-300/[.08] text-emerald-100"
                }`}
              >
                {game.lastEvent.kind === "wrong"
                  ? `${lastActor} mencoba ${game.lastEvent.cipherLetter} = ${game.lastEvent.plainLetter}. Hati Sandi berkurang.`
                  : `${lastActor} menemukan ${game.lastEvent.cipherLetter} = ${game.lastEvent.plainLetter}.`}
              </div>
            )}

            <ErrorNotice message={error} />
          </div>
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
            <p className="text-xs font-bold text-cyan-300">1. PILIH SANDI</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Tekan huruf bawah pada kutipan yang belum terbuka.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
            <p className="text-xs font-bold text-violet-300">2. TEBAK ARTI</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Satu huruf asli hanya dapat dipakai oleh satu sandi.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
            <p className="text-xs font-bold text-rose-300">3. JAGA HATI</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Tebakan salah mengurangi satu Hati Sandi bersama.
            </p>
          </div>
        </section>

        <button type="button" onClick={leaveRoom} className="mt-7 w-full text-center text-sm text-zinc-600 hover:text-white">
          Keluar dari room
        </button>
      </div>
    </Shell>
  );
}
