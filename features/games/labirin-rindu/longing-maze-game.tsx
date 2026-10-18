"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useState,
} from "react";

import type { PlayerRole } from "@/features/platform/room/types";
import { useAppLanguage } from "@/features/platform/i18n/language-provider";
import { localizeRuntimeText } from "@/features/platform/i18n/runtime-text";

import { MazeFailureScene } from "./maze-failure-scene";
import { MazeFinishCelebration } from "./maze-finish-celebration";

import type {
  MazeBossProtection,
  MazeDirection,
} from "./engine";
import type {
  LongingMazeRoomView,
  MazeCellView,
} from "./room-view";
import {
  getMazeDanger,
  getMazeSkill,
  localizeMazeDanger,
  localizeMazeHistoryText,
  localizeMazeSkill,
  type MazeSkillDefinition,
  type MazeSkillId,
} from "./rpg-content";
import { useLongingMazeRoom } from "./use-longing-maze-room";

const DIRECTION_UI: Record<
  MazeDirection,
  { arrow: string; label: { id: string; en: string } }
> = {
  up: { arrow: "↑", label: { id: "Atas", en: "Up" } },
  right: { arrow: "→", label: { id: "Kanan", en: "Right" } },
  down: { arrow: "↓", label: { id: "Bawah", en: "Down" } },
  left: { arrow: "←", label: { id: "Kiri", en: "Left" } },
};

function Shell({ children }: { children: ReactNode }) {
  const { pick } = useAppLanguage();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070812] px-4 py-7 text-white sm:px-6 sm:py-9">
      <div className="pointer-events-none absolute -left-36 top-10 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-44 top-72 h-[28rem] w-[28rem] rounded-full bg-rose-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-500/[0.07] blur-3xl" />
      <div className="relative mx-auto max-w-6xl">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white"
          >
            ← {pick("Katalog", "Games")}
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-300/25 bg-rose-300/10 text-xl">
            🛡️
          </div>
        </nav>
        {children}
      </div>
    </main>
  );
}

function ErrorMessage({ message }: { message: string }) {
  const { locale } = useAppLanguage();

  return message ? (
    <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
      {localizeRuntimeText(locale, message)}
    </p>
  ) : null;
}

function playerName(
  room: LongingMazeRoomView,
  role: PlayerRole,
) {
  return role === "host"
    ? room.players.host
    : room.players.guest ?? "Pasangan";
}

function otherRole(role: PlayerRole): PlayerRole {
  return role === "host" ? "guest" : "host";
}

function GameInstructions({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { pick } = useAppLanguage();

  const missions = [
    {
      icon: "🔮",
      title: pick("Cari kekuatan", "Find useful abilities"),
      text: pick(
        "Masuki altar untuk memilih satu skill. Ada 12 altar, tetapi kalian tidak harus mengambil semuanya.",
        "Enter an altar to choose one skill. There are 12 altars, but you do not need to visit all of them.",
      ),
    },
    {
      icon: "💎",
      title: pick("Bawa satu fragmen", "Carry one fragment"),
      text: pick(
        "Siapa pun dapat mengambil fragmen mana pun. Jika kamu sudah membawa satu, sisakan fragmen lainnya untuk pasanganmu.",
        "Either player can collect either fragment. Once you carry one, leave the other for your partner.",
      ),
    },
    {
      icon: "💗",
      title: pick("Bertemu di pusat", "Meet at the center"),
      text: pick(
        "Setelah indikator mencapai 2/2 Fragmen, berdirilah bersama di pusat untuk memulai pertarungan terakhir.",
        "Once the counter reaches 2/2 Fragments, stand together at the center to begin the final battle.",
      ),
    },
  ];

  const content = (
    <div className="mt-5 border-t border-white/10 pt-5">
      <section className="rounded-2xl border border-rose-300/15 bg-gradient-to-br from-rose-300/[0.09] to-violet-300/[0.05] p-5">
        <p className="text-[10px] font-black tracking-[0.18em] text-rose-200">
          {pick("CERITA KALIAN", "YOUR STORY")}
        </p>

        <h3 className="mt-2 text-lg font-black text-white">
          {pick("Kabut Rindu memisahkan kalian.", "The Fog of Longing separated you.")}
        </h3>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {pick(
            "Kamu dapat melihat dinding di dekatmu, tetapi tidak dapat melihat bahaya yang memburumu. Hanya pasanganmu yang dapat melihat ancaman itu dan menuntunmu. Temukan dua Fragmen Hati, bertemu kembali di pusat labirin, lalu lindungi satu sama lain dari Badai Pemisah.",
            "You can see the nearby walls, but not the dangers pursuing you. Only your partner can see those threats and guide you. Find two Heart Fragments, reunite at the center of the maze, then protect each other from the Storm of Separation.",
          )}
        </p>
      </section>

      <section className="mt-6">
        <p className="text-[10px] font-black tracking-[0.18em] text-cyan-200">
          {pick("ALUR SATU GILIRAN", "HOW EACH TURN WORKS")}
        </p>

        <div className="mt-3 space-y-3">
          <div className="flex gap-4 rounded-2xl border border-violet-300/15 bg-violet-300/[0.06] p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-300/15 text-xs font-black text-violet-100">
              1
            </span>

            <div>
              <strong className="text-sm text-white">
                {pick("Penjaga membaca peta pasangan", "The guardian reads their partner's map")}
              </strong>

              <p className="mt-1 text-xs leading-5 text-zinc-400">
                {pick("Jika kartumu bertuliskan", "If your card says")}{" "}
                <b className="text-violet-100">
                  {pick("Menjadi penjaga", "You are the guardian")}
                </b>
                {pick(
                  ", lihat dinding dan bahaya di sekitar pasangan. Pilih 1–3 arah, lalu tekan",
                  ", review the walls and dangers around your partner. Choose 1–3 directions, then press",
                )}{" "}
                <b className="text-white">
                  {pick("Kirim langkah", "Send route")}
                </b>
                .
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-300/15 text-xs font-black text-cyan-100">
              2
            </span>

            <div>
              <strong className="text-sm text-white">
                {pick("Pejalan menentukan seberapa jauh ia percaya", "The traveler decides how far to trust the route")}
              </strong>

              <p className="mt-1 text-xs leading-5 text-zinc-400">
                {pick("Jika kartumu bertuliskan", "If your card says")}{" "}
                <b className="text-cyan-100">
                  {pick("Sedang berjalan", "You are traveling")}
                </b>
                {pick(
                  ", tunggu rute masuk. Lalu pilih",
                  ", wait for the route. Then choose",
                )}{" "}
                <b className="text-white">
                  {pick("Jalankan 1 arah", "Follow 1 direction")}
                </b>
                ,{" "}
                <b className="text-white">
                  {pick("2 arah", "2 directions")}
                </b>
                {pick(", atau", ", or")}{" "}
                <b className="text-white">
                  {pick("3 arah", "3 directions")}
                </b>
                {pick(
                  ". Pion bergerak otomatis sesuai urutan.",
                  ". Your piece moves automatically in that order.",
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-300/15 text-xs font-black text-amber-100">
              3
            </span>

            <div>
              <strong className="text-sm text-white">
                {pick("Selesaikan akibat perjalanan", "Resolve the outcome")}
              </strong>

              <p className="mt-1 text-xs leading-5 text-zinc-400">
                {pick(
                  "Jika suatu arah menabrak dinding, seluruh sisa rute dibatalkan. Jika pejalan menginjak bahaya, hanya penjaga yang melihat jenisnya dan memilih skill perlindungan atau",
                  "If any direction hits a wall, the rest of the route is cancelled. If the traveler steps on a danger, only the guardian sees its type and chooses a protective skill or",
                )}{" "}
                <b className="text-white">
                  {pick("Hadapi tanpa skill", "Face it without a skill")}
                </b>
                {pick(". Setelah selesai, peran bertukar.", ". Once resolved, the roles switch.")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="text-[10px] font-black tracking-[0.16em] text-zinc-500">
            {pick("CONTOH SATU GILIRAN", "EXAMPLE TURN")}
          </p>

          <p className="mt-2 text-xs leading-5 text-zinc-400">
            {pick("Penjaga mengirim", "The guardian sends")}{" "}
            <b className="text-white">↑ → →</b>
            {pick(". Pejalan memilih", ". The traveler chooses")}{" "}
            <b className="text-white">
              {pick("Jalankan 2 arah", "Follow 2 directions")}
            </b>
            {pick(
              ". Pion mencoba ↑ lalu →. Jika keduanya berhasil, pion maju dua petak dan kalian memperoleh",
              ". The piece attempts ↑ and then →. If both succeed, it advances two squares and you gain",
            )}{" "}
            <b className="text-violet-200">{pick("+1 Ikatan", "+1 Bond")}</b>
            .
          </p>
        </div>
      </section>

      <section className="mt-6">
        <p className="text-[10px] font-black tracking-[0.18em] text-amber-200">
          {pick("MISI PERJALANAN", "JOURNEY OBJECTIVES")}
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {missions.map((mission) => (
            <div
              key={mission.title}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
            >
              <span className="text-2xl">
                {mission.icon}
              </span>

              <strong className="mt-3 block text-sm text-white">
                {mission.title}
              </strong>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {mission.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <p className="text-[10px] font-black tracking-[0.18em] text-violet-200">
          {pick("TIGA HAL YANG HARUS DIJAGA", "THREE SHARED RESOURCES")}
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-rose-300/10 bg-rose-300/[0.04] p-4">
            <strong className="text-sm text-rose-100">
              ♥ {pick("Hati", "Hearts")}
            </strong>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              {pick(
                "Daya tahan setiap pemain. Jika salah satunya mencapai nol, kalian kalah.",
                "Each player's health. If either reaches zero, you lose.",
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-300/10 bg-amber-300/[0.04] p-4">
            <strong className="text-sm text-amber-100">
              🕯️ {pick("Cahaya", "Light")}
            </strong>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              {pick(
                "Batas waktu perjalanan bersama. Setiap arah yang dicoba menghabiskan satu Cahaya, termasuk ketika menabrak dinding.",
                "Your shared time limit. Every attempted direction uses one Light, including a move into a wall.",
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-violet-300/10 bg-violet-300/[0.04] p-4">
            <strong className="text-sm text-violet-100">
              💞 {pick("Ikatan", "Bond")}
            </strong>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              {pick(
                "Energi untuk skill, dengan kapasitas awal lima. Rute sukses dua arah memberi +1, tiga arah memberi +2, dan mengambil fragmen memberi +1.",
                "Energy for skills, with a starting capacity of five. A successful two-step route gives +1, three steps give +2, and collecting a fragment gives +1.",
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/[0.06] p-5">
        <p className="text-[10px] font-black tracking-[0.18em] text-fuchsia-200">
          {pick("PERTARUNGAN TERAKHIR", "FINAL BATTLE")}
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {pick(
            "Badai Pemisah berlangsung selama tiga gelombang. Pada setiap gelombang, kamu melihat serangan yang menuju pasanganmu. Pilih skill yang sesuai, gunakan",
            "The Storm of Separation lasts three waves. During each wave, you see the attack aimed at your partner. Choose a suitable skill, use",
          )}{" "}
          <b className="text-violet-100">
            {pick("Perisai Ikatan", "Bond Shield")}
          </b>{" "}
          {pick("seharga 2 Ikatan, atau pilih", "for 2 Bond Energy, or choose")}{" "}
          <b className="text-white">
            {pick("Bertahan tanpa perlindungan", "Endure without protection")}
          </b>
          {pick(
            ". Kalian menang setelah selamat dari gelombang ketiga.",
            ". You win after surviving the third wave.",
          )}
        </p>
      </section>

      <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs leading-5 text-zinc-500">
        {pick(
          "Catatan: petak 🔒 tetap dapat dilewati sebelum fragmen lengkap. Inventaris menyimpan maksimal empat skill; skill kelima menggantikan skill yang paling lama.",
          "Note: you may pass through the 🔒 square before collecting both fragments. The inventory holds four skills; a fifth replaces the oldest one.",
        )}
      </p>
    </div>
  );

  if (compact) {
    return (
      <details className="group rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4">
        <summary className="flex cursor-pointer list-none items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-400/10 text-lg">
            🛡️
          </span>

          <span className="min-w-0 flex-1">
            <strong className="block text-sm">
              {pick("Cara bermain", "How to play")}
            </strong>

            <span className="text-xs text-zinc-500">
              {pick(
                "Baca cerita dan pelajari alur setiap giliran",
                "Read the story and learn each turn's sequence",
              )}
            </span>
          </span>

          <span className="text-zinc-500 transition group-open:rotate-180">
            ⌄
          </span>
        </summary>

        {content}
      </details>
    );
  }

  return (
    <section className="mt-8 rounded-[2rem] border border-rose-300/20 bg-white/[0.045] p-6 sm:p-7">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-400/10 text-xl">
          💞
        </span>

        <div>
          <p className="text-xs font-black tracking-[0.18em] text-rose-300">
            {pick("RPG KOOPERATIF", "COOPERATIVE RPG")}
          </p>

          <h2 className="mt-1 text-xl font-black">
            {pick("Kamu adalah penjaga pasanganmu", "You are your partner's guardian")}
          </h2>
        </div>
      </div>

      {content}
    </section>
  );
}
function wallStyle(cell: MazeCellView): CSSProperties {
  if (!cell.visible || !cell.openings) {
    return { border: "1px solid rgba(255,255,255,0.04)" };
  }
  const open = new Set(cell.openings);
  const wall = "2px solid rgba(216,180,254,0.68)";
  const corridor = "1px solid rgba(255,255,255,0.035)";
  return {
    borderTop: open.has("up") ? corridor : wall,
    borderRight: open.has("right") ? corridor : wall,
    borderBottom: open.has("down") ? corridor : wall,
    borderLeft: open.has("left") ? corridor : wall,
  };
}

function MazeBoard({ room }: { room: LongingMazeRoomView }) {
  const { locale, pick } = useAppLanguage();
  const game = room.game;
  const fragmentsReady =
    game.playerState.host.fragment && game.playerState.guest.fragment;

  return (
    <div>
      <div
        className="mx-auto grid aspect-square w-full max-w-[590px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/30 p-2 shadow-2xl shadow-violet-950/30 sm:p-3"
        style={{
          gridTemplateColumns: `repeat(${game.size}, minmax(0, 1fr))`,
        }}
      >
        {game.cells.map((cell) => {
          const cellId = `${cell.x}:${cell.y}`;
          const activeHere = cell.players.includes(game.turn);
          const background =
            cell.special === "meeting"
              ? fragmentsReady
                ? "bg-rose-400/20"
                : "bg-zinc-400/10"
              : cell.special === "danger"
                ? "bg-red-400/15"
                : cell.special === "altar"
                  ? "bg-violet-400/15"
                  : cell.special === "fragment"
                    ? "bg-amber-300/15"
                    : cell.visible
                      ? "bg-white/[0.055]"
                      : cell.explored
                        ? "bg-cyan-300/[0.035]"
                        : "bg-white/[0.012]";

          return (
            <div
              key={cellId}
              style={wallStyle(cell)}
              className={`relative flex aspect-square min-w-0 items-center justify-center ${background} ${
                activeHere
                  ? "z-10 ring-2 ring-inset ring-cyan-300/60"
                  : ""
              }`}
              aria-label={pick(
                `Petak ${cell.x + 1}, ${cell.y + 1}`,
                `Square ${cell.x + 1}, ${cell.y + 1}`,
              )}
            >
              {!cell.visible && !cell.explored && cell.special === null && (
                <span className="text-[10px] text-white/[0.06]">·</span>
              )}
              {cell.explored && cell.special === null && (
                <span className="absolute h-1.5 w-1.5 rounded-full bg-cyan-200/20" />
              )}
              {cell.special === "meeting" && (
                <span className="absolute text-sm opacity-80 sm:text-xl">
                  {fragmentsReady ? "💗" : "🔒"}
                </span>
              )}
              {cell.special === "altar" && (
                <span className="absolute text-xs opacity-80 sm:text-lg">
                  {cell.completed ? "✦" : "🔮"}
                </span>
              )}
              {cell.special === "fragment" && (
                <span
                  title={pick(
                    "Fragmen Hati — setiap pemain dapat membawa satu",
                    "Heart Fragment — each player can carry one",
                  )}
                  className="absolute text-xs drop-shadow-[0_0_8px_rgba(253,224,71,0.7)] sm:text-lg"
                >
                  💎
                </span>
              )}
              {cell.special === "danger" && cell.danger && (
                <span
                  title={localizeMazeDanger(cell.danger, locale).name}
                  className="absolute text-xs sm:text-lg"
                >
                  {cell.danger.emoji}
                </span>
              )}
              {cell.hunters.length > 0 && (
                <span className="absolute right-1 top-0 text-xs drop-shadow-[0_0_7px_rgba(244,63,94,0.8)] sm:text-lg">
                  👤
                </span>
              )}
              {cell.players.length > 0 && (
                <div className="relative z-10 flex items-center gap-0.5">
                  {cell.players.map((role) => (
                    <span
                      key={role}
                      title={`${playerName(
                        room,
                        role,
                      )}${
                        room.you === role
                          ? pick(" · Pionmu", " · Your piece")
                          : ""
                      }`}
                      className={`relative flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-black sm:h-8 sm:w-8 sm:text-xs ${
                        role === "host"
                          ? "border-cyan-100 bg-cyan-400 text-slate-950 shadow-cyan-500/30"
                          : "border-pink-100 bg-pink-400 text-slate-950 shadow-pink-500/30"
                      } ${
                        room.you === role
                          ? "z-20 ring-2 ring-white/90 ring-offset-2 ring-offset-[#090a14] shadow-[0_0_8px_rgba(255,255,255,0.9),0_0_22px_rgba(196,181,253,0.7)]"
                          : "shadow-lg opacity-85"
                      }`}
                    >
                      {playerName(room, role)
                        .trim()
                        .charAt(0)
                        .toUpperCase()}

                      {room.you === role && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -right-1 -top-1 h-2 w-2 rounded-full border border-white bg-violet-200 shadow-[0_0_8px_rgba(255,255,255,1)]"
                        />
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-zinc-500">
        <span>💗 {pick("Titik temu", "Meeting point")}</span>
        <span>💎 {pick("Fragmen", "Fragment")}</span>
        <span>🔮 {pick("Altar skill", "Skill altar")}</span>
        <span>👤 {pick("Pemburu", "Hunter")}</span>
        <span>
          {pick(
            "Bahaya hanya terlihat oleh penjaga",
            "Only the guardian can see dangers",
          )}
        </span>
      </div>
    </div>
  );
}

function DirectionPad({
  onDirection,
  stepCount,
  disabled = false,
}: {
  onDirection(direction: MazeDirection): void;
  stepCount: number;
  disabled?: boolean;
}) {
  const { locale, pick } = useAppLanguage();

  function directionButton(
    direction: MazeDirection,
    placement: string,
    shape: string,
  ) {
    const item = DIRECTION_UI[direction];

    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onDirection(direction)}
        aria-label={pick(
          `Tambah langkah ke ${item.label.id.toLowerCase()}`,
          `Add a step ${item.label.en.toLowerCase()}`,
        )}
        className={`group ${placement} ${shape} relative flex h-16 w-16 touch-manipulation select-none flex-col items-center justify-center border border-violet-200/25 bg-gradient-to-b from-violet-300/20 to-violet-500/10 text-violet-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_22px_rgba(0,0,0,0.28)] transition duration-150 hover:border-violet-200/45 hover:from-violet-300/30 hover:to-violet-500/20 active:scale-90 active:bg-violet-400/30 disabled:cursor-not-allowed disabled:opacity-30`}
      >
        <span className="text-2xl font-black leading-none transition-transform group-hover:scale-110">
          {item.arrow}
        </span>

        <span className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-violet-200/60">
          {item.label[locale]}
        </span>
      </button>
    );
  }

  return (
    <div className="mx-auto w-fit rounded-[2rem] border border-white/10 bg-black/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_22px_45px_rgba(0,0,0,0.25)]">
      <div className="grid grid-cols-3 grid-rows-3 gap-1.5">
        {directionButton(
          "up",
          "col-start-2 row-start-1",
          "rounded-t-[1.35rem] rounded-b-xl",
        )}

        {directionButton(
          "left",
          "col-start-1 row-start-2",
          "rounded-l-[1.35rem] rounded-r-xl",
        )}

        <div className="col-start-2 row-start-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0b0b16] shadow-[inset_0_0_18px_rgba(139,92,246,0.14)]">
          <div className="flex h-11 w-11 flex-col items-center justify-center rounded-full border border-violet-300/20 bg-violet-400/10">
            <span className="text-sm font-black text-violet-100">
              {stepCount}/3
            </span>

            <span className="text-[7px] font-bold uppercase tracking-[0.12em] text-zinc-500">
              {pick("langkah", "steps")}
            </span>
          </div>
        </div>

        {directionButton(
          "right",
          "col-start-3 row-start-2",
          "rounded-r-[1.35rem] rounded-l-xl",
        )}

        {directionButton(
          "down",
          "col-start-2 row-start-3",
          "rounded-b-[1.35rem] rounded-t-xl",
        )}
      </div>

      <p className="mt-3 text-center text-[10px] font-semibold tracking-wide text-zinc-500">
        {pick(
          "Pilih arah untuk menyusun maksimal 3 langkah",
          "Choose directions to build a route of up to 3 steps",
        )}
      </p>
    </div>
  );
}

function RoutePlanner({
  busy,
  onSend,
}: {
  busy: boolean;
  onSend(directions: MazeDirection[]): void;
}) {
  const { pick } = useAppLanguage();
  const [route, setRoute] = useState<MazeDirection[]>([]);

  function add(direction: MazeDirection) {
    setRoute((current) =>
      current.length >= 3 ? current : [...current, direction],
    );
  }

  return (
    <section className="rounded-[2rem] border border-violet-300/25 bg-violet-300/[0.07] p-6">
      <p className="text-xs font-black tracking-[0.18em] text-violet-200">
        {pick("KAMU MENJAGA", "YOU ARE THE GUARDIAN")}
      </p>
      <h2 className="mt-2 text-2xl font-black">
        {pick("Susun rute pasanganmu.", "Build your partner's route.")}
      </h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        {pick(
          "Kamu dapat melihat dinding dan bahaya di dekat pasanganmu. Semua arah dapat dikirim; periksa petanya dengan teliti.",
          "You can see the walls and dangers near your partner. Any direction can be sent, so review the map carefully.",
        )}
      </p>
      <div className="mt-5 flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 p-3">
        {route.length === 0 ? (
          <span className="text-sm text-zinc-600">
            {pick("Belum ada arah", "No directions yet")}
          </span>
        ) : (
          route.map((direction, index) => (
            <span
              key={`${direction}-${index}`}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/15 text-2xl text-violet-100"
            >
              {DIRECTION_UI[direction].arrow}
            </span>
          ))
        )}
      </div>
      <div className="mt-4">
        <DirectionPad
          onDirection={add}
          stepCount={route.length}
          disabled={busy || route.length >= 3}
        />
      </div>
      <div className="mt-4 grid grid-cols-[0.7fr_1.3fr] gap-2">
        <button
          type="button"
          disabled={busy || route.length === 0}
          onClick={() => setRoute((current) => current.slice(0, -1))}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 disabled:opacity-40"
        >
          {pick("Hapus", "Remove")}
        </button>
        <button
          type="button"
          disabled={busy || route.length === 0}
          onClick={() => {
            onSend(route);
            setRoute([]);
          }}
          className="rounded-2xl bg-violet-500 px-4 py-3 font-bold hover:bg-violet-400 disabled:opacity-40"
        >
          {pick("Kirim", "Send")} {route.length || ""}{" "}
          {pick("langkah", "steps")}
        </button>
      </div>
    </section>
  );
}

function SkillCard({
  skill,
  disabled,
  actionLabel,
  onClick,
}: {
  skill: MazeSkillDefinition;
  disabled: boolean;
  actionLabel: string;
  onClick(): void;
}) {
  const { locale } = useAppLanguage();
  const localizedSkill = localizeMazeSkill(skill, locale);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-violet-300/30 hover:bg-violet-300/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{localizedSkill.emoji}</span>
        <span className="min-w-0 flex-1">
          <strong className="block text-sm">{localizedSkill.name}</strong>
          <span className="mt-1 block text-xs leading-5 text-zinc-500">
            {localizedSkill.description}
          </span>
          <span className="mt-2 block text-[11px] font-bold text-violet-300">
            {actionLabel} · {localizedSkill.cost}{" "}
            {locale === "id" ? "Ikatan" : "Bond"}
          </span>
        </span>
      </div>
    </button>
  );
}

function InventoryPanel({
  room,
  busy,
  onUse,
}: {
  room: LongingMazeRoomView;
  busy: boolean;
  onUse(skillId: MazeSkillId): void;
}) {
  const { pick } = useAppLanguage();
  const game = room.game;
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.16em] text-zinc-500">
            {pick("SKILL PENJAGA", "GUARDIAN SKILLS")}
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            {pick(
              "Selalu digunakan untuk pasanganmu",
              "Always used to protect your partner",
            )}
          </p>
        </div>
        <span className="rounded-full bg-violet-300/10 px-3 py-1 text-xs text-violet-200">
          {game.inventory.length}/4
        </span>
      </div>
      {game.inventory.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-white/10 p-4 text-sm text-zinc-600">
          {pick(
            "Jelajahi altar 🔮 untuk mendapatkan skill.",
            "Explore an altar 🔮 to gain a skill.",
          )}
        </p>
      ) : (
        <div className="mt-4 grid gap-2">
          {game.inventory.map((skill, index) => (
            <SkillCard
              key={`${skill.id}-${index}`}
              skill={skill}
              disabled={
                busy || !game.usableGuideSkillIds.includes(skill.id)
              }
              actionLabel={pick("Gunakan", "Use")}
              onClick={() => onUse(skill.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PlayerCard({
  room,
  role,
}: {
  room: LongingMazeRoomView;
  role: PlayerRole;
}) {
  const { locale, pick } = useAppLanguage();
  const state = room.game.playerState[role];
  const active = room.game.turn === role;

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        active
          ? "border-cyan-300/30 bg-cyan-300/10"
          : "border-white/10 bg-white/[0.035]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">
            {playerName(room, role)}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            {active
              ? pick("Sedang berjalan", "Traveling")
              : pick("Menjadi penjaga", "Guardian")}
          </p>
        </div>

        <span
          title={
            state.fragment
              ? pick("Fragmen Hati sudah ditemukan", "Heart Fragment found")
              : pick("Fragmen Hati belum ditemukan", "Heart Fragment not found")
          }
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold sm:text-xs ${
            state.fragment
              ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
              : "border-white/10 bg-white/[0.035] text-zinc-500"
          }`}
        >
          {state.fragment
            ? pick("💎 Didapat", "💎 Found")
            : pick("◇ Belum", "◇ Not yet")}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="tracking-wider text-rose-300">
          {"♥".repeat(state.hearts)}

          <span className="text-white/10">
            {"♥".repeat(3 - state.hearts)}
          </span>
        </span>

        <span className="text-zinc-500">
          {state.skillCount} {pick("skill", "skills")}
        </span>
      </div>

      <div className="mt-3 border-t border-white/[0.06] pt-3">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">
          {pick("Skill terkumpul", "Collected skills")}
        </p>

        {state.skills.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {state.skills.map((skill, index) => {
              const localizedSkill = localizeMazeSkill(skill, locale);

              return (
              <span
                key={`${skill.id}-${index}`}
                title={pick(
                  `${localizedSkill.description} Biaya: ${skill.cost} Ikatan.`,
                  `${localizedSkill.description} Cost: ${skill.cost} Bond.`,
                )}
                className="inline-flex items-center gap-1 rounded-lg border border-violet-300/15 bg-violet-300/[0.07] px-2 py-1 text-[10px] leading-4 text-violet-100"
              >
                <span>{localizedSkill.emoji}</span>
                <span>{localizedSkill.name}</span>
              </span>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-zinc-600">
            {pick("Belum memiliki skill.", "No skills collected yet.")}
          </p>
        )}
      </div>
    </div>
  );
}

function SkillChoicePanel({
  room,
  busy,
  onChoose,
}: {
  room: LongingMazeRoomView;
  busy: boolean;
  onChoose(skillId: MazeSkillId): void;
}) {
  const { pick } = useAppLanguage();
  const choice = room.game.pendingSkill;
  if (!choice) return null;
  if (!choice.options) {
    return (
      <section className="rounded-[2rem] border border-violet-300/25 bg-violet-300/[0.07] p-6 text-center">
        <div className="text-4xl">🔮</div>
        <h2 className="mt-4 text-xl font-black">
          {playerName(room, choice.forRole)}{" "}
          {pick("menemukan Altar Ikatan", "found a Bond Altar")}
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          {pick(
            "Pasanganmu sedang memilih kemampuan untuk melindungimu.",
            "Your partner is choosing an ability to protect you.",
          )}
        </p>
      </section>
    );
  }
  return (
    <section className="rounded-[2rem] border border-violet-300/30 bg-violet-300/[0.08] p-6">
      <div className="text-4xl">🔮</div>
      <p className="mt-4 text-xs font-black tracking-[0.18em] text-violet-200">
        {pick("ALTAR IKATAN", "BOND ALTAR")}
      </p>
      <h2 className="mt-2 text-2xl font-black">
        {pick("Pilih satu skill penjaga.", "Choose one guardian skill.")}
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        {pick(
          "Skill ini tidak dapat digunakan untuk melindungi dirimu sendiri. Simpan untuk pasanganmu.",
          "This skill cannot protect you from your own danger. Save it for your partner.",
        )}
      </p>
      <div className="mt-5 grid gap-3">
        {choice.options.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            disabled={busy}
            actionLabel={pick("Ambil skill", "Take skill")}
            onClick={() => onChoose(skill.id)}
          />
        ))}
      </div>
    </section>
  );
}

function DangerPanel({
  room,
  busy,
  onResolve,
}: {
  room: LongingMazeRoomView;
  busy: boolean;
  onResolve(skillId?: MazeSkillId): void;
}) {
  const { locale, pick } = useAppLanguage();
  const encounter = room.game.pendingDanger;

  if (!encounter?.danger) {
    return null;
  }

  const danger = localizeMazeDanger(encounter.danger, locale);

  if (!encounter.canProtect) {
    return (
      <section
        aria-live="polite"
        className="rounded-[2rem] border border-red-300/30 bg-red-300/[0.08] p-6"
      >
        <div className="flex items-start gap-4">
          <span className="text-5xl">{danger.emoji}</span>

          <div>
            <p className="text-xs font-black tracking-[0.18em] text-red-200">
              {pick("KAMU MENGINJAK BAHAYA", "YOU STEPPED INTO DANGER")}
            </p>

            <h2 className="mt-2 text-2xl font-black">
              {danger.name}
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {danger.description}
            </p>

            <p className="mt-2 text-sm font-semibold text-red-100">
              {pick("Jika tidak dicegah:", "If not prevented:")} {danger.consequence}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.07] p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🛡️</span>

            <div>
              <p className="text-xs font-black tracking-[0.14em] text-emerald-200">
                {pick("PASANGANMU SEDANG BERTINDAK", "YOUR PARTNER IS RESPONDING")}
              </p>

              <p className="mt-1 text-sm leading-6 text-zinc-400">
                {playerName(
                  room,
                  otherRole(encounter.target),
                )}{" "}
                {pick(
                  "sedang memilih cara untuk melindungimu. Setelah keputusan dibuat, kamu akan melihat perlindungan yang digunakan.",
                  "is choosing how to protect you. Once the decision is made, you will see which protection was used.",
                )}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const counters = room.game.inventory.filter((skill) =>
    encounter.usableSkillIds.includes(skill.id),
  );

  return (
    <section className="rounded-[2rem] border border-red-300/30 bg-red-300/[0.08] p-6">
      <div className="flex items-start gap-4">
        <span className="text-5xl">{danger.emoji}</span>

        <div>
          <p className="text-xs font-black tracking-[0.18em] text-red-200">
            {pick("PASANGANMU TERANCAM", "YOUR PARTNER IS IN DANGER")}
          </p>

          <h2 className="mt-2 text-2xl font-black">
            {danger.name}
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {danger.description}
          </p>

          <p className="mt-2 text-sm font-semibold text-red-100">
            {pick("Jika tidak dicegah:", "If not prevented:")} {danger.consequence}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {counters.map((skill, index) => (
          <SkillCard
            key={`${skill.id}-${index}`}
            skill={skill}
            disabled={busy}
            actionLabel={pick("Lindungi sekarang", "Protect now")}
            onClick={() => onResolve(skill.id)}
          />
        ))}

        {counters.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm leading-6 text-zinc-500">
            {pick(
              "Kamu belum memiliki skill yang sesuai. Bahaya tetap dapat diselesaikan, tetapi pasanganmu akan menerima akibatnya.",
              "You do not have a suitable skill. The danger can still be resolved, but your partner will face its consequence.",
            )}
          </p>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => onResolve()}
          className="rounded-2xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm font-bold text-red-100 hover:bg-red-300/20 disabled:opacity-40"
        >
          {pick("Hadapi tanpa skill", "Face it without a skill")}
        </button>
      </div>
    </section>
  );
}

function DangerResultPanel({
  room,
}: {
  room: LongingMazeRoomView;
}) {
  const { locale, pick } = useAppLanguage();
  const result =
    room.game.history[0]?.dangerResolution;

  if (!result || result.target !== room.you) {
    return null;
  }

  const protectorName = playerName(
    room,
    result.protector,
  );

  const danger = localizeMazeDanger(
    getMazeDanger(result.danger),
    locale,
  );

  const protection = result.skillId
    ? localizeMazeSkill(getMazeSkill(result.skillId), locale)
    : null;

  return (
    <section
      aria-live="polite"
      className={`rounded-[2rem] border p-6 ${
        result.prevented
          ? "border-emerald-300/30 bg-emerald-300/[0.08]"
          : "border-amber-300/30 bg-amber-300/[0.08]"
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="text-5xl">
          {result.prevented
            ? "🛡️"
            : danger.emoji}
        </span>

        <div>
          <p
            className={`text-xs font-black tracking-[0.18em] ${
              result.prevented
                ? "text-emerald-200"
                : "text-amber-200"
            }`}
          >
            {result.prevented
              ? pick("KAMU BERHASIL DILINDUNGI", "YOU WERE PROTECTED")
              : pick("BAHAYA MENGENAIMU", "THE DANGER HIT YOU")}
          </p>

          <h2 className="mt-2 text-2xl font-black">
            {danger.emoji} {danger.name}
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {danger.description}
          </p>
        </div>
      </div>

      {protection ? (
        <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-black/20 p-4">
          <p className="text-xs font-black tracking-[0.14em] text-emerald-200">
            {pick("PERLINDUNGAN DARI", "PROTECTION FROM")}{" "}
            {protectorName.toUpperCase()}
          </p>

          <div className="mt-3 flex items-start gap-3">
            <span className="text-3xl">
              {protection.emoji}
            </span>

            <div>
              <p className="font-black text-white">
                {protection.name}
              </p>

              <p className="mt-1 text-sm leading-6 text-zinc-400">
                {protection.description}
              </p>

              <p className="mt-2 text-sm font-semibold text-emerald-100">
                {pick("Akibat berhasil dibatalkan:", "Consequence prevented:")}{" "}
                “{danger.consequence}”
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-amber-300/20 bg-black/20 p-4">
          <p className="text-xs font-black tracking-[0.14em] text-amber-200">
            {pick("TANPA SKILL PERLINDUNGAN", "NO PROTECTIVE SKILL")}
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {pick(
              `${protectorName} tidak menggunakan skill untuk menahan bahaya ini. Akibat yang diterima:`,
              `${protectorName} did not use a skill against this danger. Consequence:`,
            )}{" "}
            {danger.consequence}
          </p>
        </div>
      )}
    </section>
  );
}

function BossPanel({
  room,
  busy,
  onProtect,
}: {
  room: LongingMazeRoomView;
  busy: boolean;
  onProtect(protection: MazeBossProtection): void;
}) {
  const { locale, pick } = useAppLanguage();
  const boss = room.game.boss;
  if (!boss) return null;
  const danger = boss.attackOnPartner
    ? localizeMazeDanger(boss.attackOnPartner, locale)
    : null;
  const skills = room.game.inventory.filter((skill) =>
    boss.usableSkillIds.includes(skill.id),
  );
  return (
    <section className="rounded-[2rem] border border-fuchsia-300/30 bg-gradient-to-b from-fuchsia-400/10 to-red-400/[0.06] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-[0.18em] text-fuchsia-200">
            {pick("BADAI PEMISAH · GELOMBANG", "STORM OF SEPARATION · WAVE")}{" "}
            {boss.round}/{boss.totalRounds}
          </p>
          <h2 className="mt-2 text-2xl font-black">
            {pick("Lindungi pasanganmu.", "Protect your partner.")}
          </h2>
        </div>
        <span className="text-4xl">🌪️</span>
      </div>
      {danger && (
        <div className="mt-5 rounded-2xl border border-red-300/20 bg-black/20 p-4">
          <p className="text-xs font-bold text-red-200">
            {pick("SERANGAN YANG KAMU LIHAT", "THE ATTACK YOU CAN SEE")}
          </p>
          <p className="mt-2 text-lg font-black">
            {danger.emoji} {danger.name}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            {pick("Mengarah ke", "Aimed at")} {playerName(room, room.you ? otherRole(room.you) : "guest")}.
          </p>
        </div>
      )}
      {boss.submittedYou ? (
        <p className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5 text-center text-sm text-zinc-400">
          {pick(
            "Perlindunganmu sudah siap. Menunggu pasangan memilih…",
            "Your protection is ready. Waiting for your partner…",
          )}
        </p>
      ) : (
        <div className="mt-5 grid gap-3">
          {skills.map((skill, index) => (
            <SkillCard
              key={`${skill.id}-${index}`}
              skill={skill}
              disabled={busy}
              actionLabel={pick("Gunakan melawan badai", "Use against the storm")}
              onClick={() => onProtect(skill.id)}
            />
          ))}
          <button
            type="button"
            disabled={busy || !boss.canUseBond}
            onClick={() => onProtect("bond")}
            className="rounded-2xl border border-violet-300/25 bg-violet-300/10 px-4 py-3 text-left font-bold text-violet-100 disabled:opacity-40"
          >
            💞 {pick("Perisai Ikatan", "Bond Shield")}
            <span className="mt-1 block text-xs font-normal text-zinc-400">
              {pick(
                "Perlindungan universal · membutuhkan 2 Ikatan",
                "Universal protection · requires 2 Bond Energy",
              )}
            </span>
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onProtect("endure")}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 disabled:opacity-40"
          >
            {pick("Bertahan tanpa perlindungan", "Endure without protection")}
          </button>
        </div>
      )}
    </section>
  );
}

function MazePrologue({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const { pick } = useAppLanguage();
  const missions = [
    {
      icon: "🧭",
      title: pick("Percayai pasanganmu", "Trust your partner"),
      text: pick(
        "Saat kamu berjalan, pasanganmu melihat bahaya yang tidak dapat kamu lihat dan menunjukkan arah yang aman.",
        "While you travel, your partner can see dangers hidden from you and guide you toward a safe route.",
      ),
    },
    {
      icon: "🛡️",
      title: pick("Lindungi satu sama lain", "Protect each other"),
      text: pick(
        "Kamu tidak dapat melindungi dirimu sendiri. Hanya kamu yang dapat melindungi pasanganmu ketika bahaya menyerang.",
        "You cannot protect yourself. Only you can protect your partner when danger strikes.",
      ),
    },
    {
      icon: "🔮",
      title: pick("Persiapkan kemampuan", "Prepare your abilities"),
      text: pick(
        "Singgahi altar selama perjalanan untuk memperoleh skill dan memperkuat Ikatan kalian.",
        "Visit altars along the way to gain skills and strengthen your Bond.",
      ),
    },
    {
      icon: "💗",
      title: pick("Hadapi pertarungan terakhir", "Face the final battle"),
      text: pick(
        "Temukan dua Fragmen Hati, buka pintu di pusat labirin, lalu hadapi Badai Pemisah bersama.",
        "Find two Heart Fragments, open the gate at the maze's center, then face the Storm of Separation together.",
      ),
    },
  ];

  return (
    <Shell>
      <section className="mx-auto mt-10 max-w-4xl rounded-[2rem] border border-rose-300/20 bg-gradient-to-b from-rose-300/[0.09] to-violet-300/[0.04] p-6 text-center shadow-2xl shadow-black/30 sm:p-10">
        <div className="text-5xl">🕯️ 🌫️ 🕯️</div>

        <p className="mt-6 text-xs font-black tracking-[0.22em] text-rose-300">
          {pick("PROLOG · LABIRIN RINDU", "PROLOGUE · MAZE OF LONGING")}
        </p>

        <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
          {pick("Kalian terpisah di dalam labirin.", "You are separated inside the maze.")}
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
          {pick(
            "Ketika kabut turun, kalian terbangun di lorong yang berbeda. Carilah jalan untuk kembali bertemu, tetapi jangan berjalan tanpa panduan. Bahaya yang tidak dapat kamu lihat justru terlihat oleh pasanganmu.",
            "When the fog descends, you wake in separate corridors. Find your way back to each other, but do not travel without guidance. The dangers hidden from you are visible to your partner.",
          )}
        </p>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
          {missions.map((mission) => (
            <article
              key={mission.title}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <span className="text-2xl">{mission.icon}</span>

              <strong className="mt-3 block text-sm text-white">
                {mission.title}
              </strong>

              <p className="mt-1 text-xs leading-5 text-zinc-400">
                {mission.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] px-5 py-4">
          <strong className="text-sm text-amber-100">
            {pick("Percayalah kepada pasanganmu.", "Trust your partner.")}
          </strong>

          <p className="mt-1 text-xs leading-5 text-zinc-400">
            {pick(
              "Dengarkan petunjuknya ketika kamu berjalan. Saat giliranmu menjaga, keselamatan pasanganmu berada di tanganmu.",
              "Follow their guidance while you travel. When you become the guardian, your partner's safety is in your hands.",
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-7 w-full rounded-2xl bg-gradient-to-r from-violet-500 via-pink-500 to-rose-500 px-6 py-4 font-black shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]"
        >
          {pick("Aku siap mempercayai pasangan", "I am ready to trust my partner")}
        </button>
      </section>
    </Shell>
  );
}

export default function LongingMazeGame() {
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
  } = useLongingMazeRoom();
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const [readyRoomCode, setReadyRoomCode] = useState<
  string | null
>(null);

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
        <div className="mt-28 text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-3xl bg-rose-400/10" />
          <p className="mt-5 text-zinc-400">
            {pick("Menyalakan Cahaya Ikatan…", "Lighting the Bond…")}
          </p>
        </div>
      </Shell>
    );
  }

  if (!room) {
    return (
      <Shell>
        <header className="mt-14 max-w-4xl">
          <p className="text-xs font-black tracking-[0.24em] text-rose-300">
            {pick("LABIRIN RINDU · PENJAGA HATI", "MAZE OF LONGING · HEART GUARDIANS")}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
            {pick(
              "Bahayamu terlihat olehnya. Bahayanya terlihat olehmu.",
              "Your partner sees your danger. You see theirs.",
            )}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            {pick(
              "Jelajahi labirin 7×7, temukan skill, lindungi pasangan dari bahaya yang tidak dapat mereka lihat, dan hadapi Badai Pemisah bersama.",
              "Explore a 7×7 maze, collect skills, protect your partner from dangers they cannot see, and face the Storm of Separation together.",
            )}
          </p>
          <div className="mt-7 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-rose-100">
              {pick("🛡️ RPG kooperatif", "🛡️ Cooperative RPG")}
            </span>
            <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-violet-100">
              {pick("🔮 9 skill", "🔮 9 skills")}
            </span>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-cyan-100">
              {pick("💗 15–20 menit", "💗 15–20 minutes")}
            </span>
          </div>
        </header>
        <GameInstructions />
        <section className="mt-8 grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
          <form
            onSubmit={handleCreate}
            className="rounded-[2rem] border border-rose-300/20 bg-white/[0.05] p-6 shadow-2xl shadow-black/20"
          >
            <p className="text-xs font-bold tracking-[0.18em] text-zinc-500">
              {pick("MULAI PETUALANGAN", "START THE JOURNEY")}
            </p>
            <label
              htmlFor="maze-create-name"
              className="mt-6 block text-sm font-medium text-zinc-300"
            >
              {pick("Nama panggilanmu", "Your display name")}
            </label>
            <input
              id="maze-create-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              maxLength={20}
              required
              placeholder={pick("Misalnya: Ara", "For example: Alex")}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 outline-none focus:border-rose-400/50"
            />
            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full rounded-2xl bg-rose-500 px-5 py-3.5 font-bold hover:bg-rose-400 disabled:opacity-50"
            >
              {busy
                ? pick("Membuka labirin…", "Opening the maze…")
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
              htmlFor="maze-room-code"
              className="mt-6 block text-sm font-medium text-zinc-300"
            >
              {pick("Kode ruang", "Room code")}
            </label>
            <input
              id="maze-room-code"
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
              disabled={busy || roomCode.length < 6}
              className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 font-semibold hover:bg-white/10 disabled:opacity-40"
            >
              {pick("Buka ruang", "Open room")}
            </button>
            <p className="mt-8 rounded-2xl border border-white/5 bg-black/10 p-4 text-sm leading-6 text-zinc-500">
              {pick(
                "Setiap ruang mendapatkan labirin, bahaya, altar, dan kombinasi skill baru.",
                "Every room receives a new maze, danger layout, altars, and skill combination.",
              )}
            </p>
          </form>
        </section>
        <ErrorMessage message={error} />
      </Shell>
    );
  }

  if (!room.you) {
    const roomFull = Boolean(room.players.guest);
    return (
      <Shell>
        <section className="mx-auto mt-14 max-w-3xl rounded-[2rem] border border-rose-300/25 bg-white/[0.045] p-7 text-center sm:p-10">
          <div className="text-5xl">🛡️</div>
          <p className="mt-6 text-xs font-black tracking-[0.22em] text-rose-300">
            {pick("PANGGILAN PENJAGA", "A GUARDIAN IS NEEDED")}
          </p>
          <h1 className="mt-4 text-3xl font-black">
            {room.players.host}{" "}
            {pick("membutuhkanmu di dalam labirin.", "needs you inside the maze.")}
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            {pick("Ruang", "Room")} <strong className="font-mono text-white">{room.code}</strong>
          </p>
          <div className="mt-7 text-left">
            <GameInstructions compact />
          </div>
          {roomFull ? (
            <p className="mt-8 rounded-2xl bg-black/20 p-4 text-zinc-300">
              {pick(
                "Ruang ini sudah memiliki dua penjaga.",
                "This room already has two guardians.",
              )}
            </p>
          ) : (
            <form
              onSubmit={handleJoin}
              className="mx-auto mt-8 max-w-md text-left"
            >
              <label
                htmlFor="maze-join-name"
                className="text-sm font-medium text-zinc-300"
              >
                {pick("Nama panggilanmu", "Your display name")}
              </label>
              <input
                id="maze-join-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={20}
                required
                placeholder={pick("Misalnya: Bima", "For example: Sam")}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 outline-none focus:border-rose-400/50"
              />
              <button
                type="submit"
                disabled={busy}
                className="mt-4 w-full rounded-2xl bg-rose-500 px-5 py-3.5 font-bold hover:bg-rose-400 disabled:opacity-50"
              >
                {busy
                  ? pick("Memasuki labirin…", "Entering the maze…")
                  : pick("Jaga pasanganmu", "Protect your partner")}
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
        <section className="mx-auto mt-16 max-w-2xl rounded-[2rem] border border-rose-300/25 bg-white/[0.045] p-8 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-400/10 text-3xl">
            🕯️
          </div>
          <p className="mt-7 text-xs font-bold tracking-[0.2em] text-zinc-500">
            {pick("MENUNGGU PENJAGA KEDUA", "WAITING FOR THE SECOND GUARDIAN")}
          </p>
          <h1 className="mt-3 font-mono text-4xl font-black tracking-[0.14em] sm:text-5xl">
            {room.code}
          </h1>
          <p className="mx-auto mt-5 max-w-sm text-zinc-400">
            {pick(
              "Bagikan tautannya. Petualangan dimulai setelah pasanganmu bergabung.",
              "Share the link. The journey begins after your partner joins.",
            )}
          </p>
          <button
            type="button"
            onClick={() => void copyInvite()}
            className="mt-8 rounded-2xl bg-rose-500 px-7 py-3.5 font-bold hover:bg-rose-400"
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
  const won = game.phase === "won";
  const lost = game.phase === "lost";
  const finished = won || lost;

  if (!finished && readyRoomCode !== room.code) {
    return (
      <MazePrologue
        onContinue={() => setReadyRoomCode(room.code)}
      />
    );
  }

  if (finished) {
    const result = game.result ?? {
      efficiency: 0,
      hearts: 0,
      protected: 0,
      skillsUsed: 0,
    };
    return (
      <Shell>
        {won && (
          <MazeFinishCelebration
            key={`${room.code}-maze-finished`}
            hostName={room.players.host}
            guestName={room.players.guest ?? pick("Pasangan", "Partner")}
          />
        )}
        {lost && (
          <MazeFailureScene
            key={`${room.code}-maze-failed`}
            reason={
              localizeMazeHistoryText(
                game.history.find(
                  (item) => item.kind === "lost",
                )?.message ??
                  "Cahaya terakhir padam sebelum perjalanan selesai.",
                locale,
              )
            }
          />
        )}
        <section className="mx-auto mt-14 max-w-3xl rounded-[2rem] border border-rose-300/20 bg-gradient-to-b from-rose-400/10 to-white/[0.03] p-8 text-center sm:p-12">
          <div className="text-6xl">{won ? "💞" : "🌫️"}</div>
          <p className="mt-6 text-xs font-bold tracking-[0.2em] text-rose-300">
            {won
              ? pick("BADAI TELAH REDA", "THE STORM HAS SUBSIDED")
              : pick("PERJALANAN TERHENTI", "THE JOURNEY ENDED")}
          </p>
          <h1 className="mt-3 text-4xl font-black">
            {won
              ? pick(
                  "Kalian menjadi pelindung satu sama lain.",
                  "You became each other's guardians.",
                )
              : pick("Labirin menang kali ini.", "The maze won this time.")}
          </h1>
          <p className="mx-auto mt-4 max-w-lg leading-7 text-zinc-400">
            {won
              ? pick(
                  "Bukan kekuatan sendiri yang membawa kalian pulang, melainkan keputusan untuk saling menjaga sampai akhir.",
                  "You found your way home through the decision to protect each other until the end.",
                )
              : pick(
                  "Susun rute dengan lebih hati-hati, jelajahi lebih banyak altar, dan simpan skill yang sesuai untuk pertarungan terakhir.",
                  "Plan routes more carefully, explore more altars, and save the right skills for the final battle.",
                )}
          </p>
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [result.hearts, pick("Hati tersisa", "Hearts left")],
              [result.protected, pick("Bahaya ditahan", "Dangers blocked")],
              [result.skillsUsed, pick("Skill dipakai", "Skills used")],
              [`${result.efficiency}%`, pick("Efisiensi", "Efficiency")],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-black/20 px-3 py-4"
              >
                <strong className="block text-xl text-rose-200">
                  {value}
                </strong>
                <span className="mt-1 block text-[11px] text-zinc-500">
                  {label}
                </span>
              </div>
            ))}
          </div>
          {room.you === "host" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void performAction("maze-restart")}
              className="mt-8 rounded-2xl bg-rose-500 px-7 py-3.5 font-bold hover:bg-rose-400 disabled:opacity-50"
            >
              {pick("Mulai petualangan baru", "Start a new journey")}
            </button>
          ) : (
            <p className="mt-8 text-sm text-zinc-500">
              {room.players.host}{" "}
              {pick("dapat membuka labirin baru…", "can open a new maze…")}
            </p>
          )}
          <button
            type="button"
            onClick={leaveRoom}
            className="mt-6 block w-full text-sm text-zinc-500 hover:text-white"
          >
            {pick("Kembali ke awal permainan", "Back to the game start")}
          </button>
          <ErrorMessage message={error} />
        </section>
      </Shell>
    );
  }

  const yourTurn = room.you === game.turn;

  return (
    <Shell>
      <header className="mt-9 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-[0.2em] text-rose-300">
            {pick("RUANG", "ROOM")} {room.code} · {pick("RONDE", "ROUND")} {game.round}
          </p>
          <h1 className="mt-2 text-3xl font-black">
            {pick("Labirin Rindu: Penjaga Hati", "Maze of Longing: Heart Guardians")}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-amber-100">
              🕯️ {game.light}/{game.maxLight}
            </span>
            <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-violet-100">
              💞 {game.bond}/{game.maxBond} {pick("Ikatan", "Bond")}
            </span>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-cyan-100">
              🔮 {game.claimedAltars}/{game.totalAltars} {pick("altar", "altars")}
            </span>
            <span className="rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-rose-100">
              💎{" "}
              {Number(game.playerState.host.fragment) +
                Number(game.playerState.guest.fragment)}
              /2 {pick("Fragmen", "Fragments")}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void copyInvite()}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300 hover:bg-white/10"
        >
          {copied
            ? pick("Tersalin ✓", "Copied ✓")
            : pick("Undang", "Invite")}
        </button>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <PlayerCard room={room} role="host" />
        <PlayerCard room={room} role="guest" />
      </div>
      <div className="mt-5">
        <GameInstructions compact />
      </div>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black tracking-[0.16em] text-zinc-500">
                {pick("PETA PERLINDUNGAN", "GUARDIAN MAP")}
              </p>
              <p className="mt-1 text-sm text-zinc-300">
                {pick(
                  "Dinding dan bahaya di dekat pasanganmu terlihat di sini.",
                  "Walls and dangers near your partner are visible here.",
                )}
              </p>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-zinc-400">
              {game.movesUsed} {pick("langkah", "steps")}
            </span>
          </div>
          {room.you && (
            <div className="mb-4 flex justify-end">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] text-zinc-400">
                <span className="h-2.5 w-2.5 rounded-full border border-white bg-violet-200 shadow-[0_0_8px_rgba(255,255,255,0.9),0_0_14px_rgba(196,181,253,0.65)]" />
                {pick("Halo putih menandai pionmu", "A white halo marks your piece")}
              </span>
            </div>
          )}
          <MazeBoard room={room} />
          <details className="group mt-4 rounded-2xl border border-white/10 bg-black/20">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-xl">
                🗺️
              </span>

              <span className="min-w-0 flex-1">
                <strong className="block text-sm text-white">
                  {pick("Legenda simbol", "Symbol legend")}
                </strong>
                <span className="text-xs text-zinc-500">
                  {pick(
                    "Tekan untuk melihat arti petak, bahaya, dan status",
                    "Open to review squares, dangers, and status symbols",
                  )}
                </span>
              </span>

              <span className="text-zinc-500 transition-transform group-open:rotate-180">
                ⌄
              </span>
            </summary>

            <div className="border-t border-white/10 p-4">
              <p className="text-[10px] font-black tracking-[0.18em] text-violet-300">
                {pick("PETA LABIRIN", "MAZE MAP")}
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  {
                    symbol: "💗",
                    title: pick("Titik temu terbuka", "Open meeting point"),
                    description: pick(
                      "Tujuan akhir setelah kedua Fragmen Hati ditemukan.",
                      "The final destination after both Heart Fragments are found.",
                    ),
                  },
                  {
                    symbol: "🔒",
                    title: pick("Titik temu terkunci", "Locked meeting point"),
                    description: pick(
                      "Belum dapat dimasuki karena fragmen belum lengkap.",
                      "It cannot be entered until both fragments are found.",
                    ),
                  },
                  {
                    symbol: "💎",
                    title: pick("Fragmen Hati", "Heart Fragment"),
                    description: pick(
                      "Siapa pun dapat mengambilnya, tetapi setiap pemain hanya dapat membawa satu.",
                      "Either player may collect it, but each can carry only one.",
                    ),
                  },
                  {
                    symbol: "🔮",
                    title: pick("Altar Ikatan", "Bond Altar"),
                    description: pick(
                      "Memberikan pilihan skill untuk melindungi pasangan.",
                      "Offers a choice of skills for protecting your partner.",
                    ),
                  },
                  {
                    symbol: "✦",
                    title: pick("Altar telah digunakan", "Used altar"),
                    description: pick(
                      "Skill dari altar ini sudah diambil.",
                      "A skill has already been taken from this altar.",
                    ),
                  },
                  {
                    symbol: "🔵",
                    title: pick("Pion host", "Host piece"),
                    description: pick(
                      "Posisi pemain yang membuat ruang.",
                      "The position of the player who created the room.",
                    ),
                  },
                  {
                    symbol: "🩷",
                    title: pick("Pion pasangan", "Partner piece"),
                    description: pick(
                      "Posisi pemain yang bergabung ke ruang.",
                      "The position of the player who joined the room.",
                    ),
                  },
                  {
                    symbol: "•",
                    title: pick("Jejak perjalanan", "Travel trail"),
                    description: pick(
                      "Petak yang pernah dilewati oleh pemain.",
                      "A square previously visited by a player.",
                    ),
                  },
                  {
                    symbol: "·",
                    title: pick("Kabut belum dipetakan", "Unmapped fog"),
                    description: pick(
                      "Area yang belum terlihat oleh kedua pemain.",
                      "An area neither player has seen.",
                    ),
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.025] p-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-lg">
                      {item.symbol}
                    </span>

                    <div>
                      <strong className="block text-xs text-zinc-200">
                        {item.title}
                      </strong>
                      <p className="mt-1 text-[11px] leading-4 text-zinc-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[10px] font-black tracking-[0.18em] text-rose-300">
                {pick("BAHAYA", "DANGERS")}
              </p>

              <p className="mt-2 text-xs leading-5 text-zinc-500">
                {pick(
                  "Bahaya di dekatmu hanya terlihat oleh pasanganmu. Dengarkan petunjuk pasangan sebelum berjalan.",
                  "Only your partner can see nearby dangers. Follow their guidance before moving.",
                )}
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  {
                    symbol: "🌹",
                    title: pick("Duri Sunyi", "Thorns of Silence"),
                    description: pick(
                      "Mengurangi satu Hati jika tidak dilindungi.",
                      "Removes one Heart if not blocked.",
                    ),
                  },
                  {
                    symbol: "🌫️",
                    title: pick("Kabut Ragu", "Fog of Doubt"),
                    description: pick(
                      "Memadamkan tiga Cahaya perjalanan.",
                      "Extinguishes three Journey Lights.",
                    ),
                  },
                  {
                    symbol: "🌊",
                    title: pick("Gelombang Jarak", "Wave of Distance"),
                    description: pick(
                      "Mundur satu petak dan kehilangan satu Hati.",
                      "Moves back one square and removes one Heart.",
                    ),
                  },
                  {
                    symbol: "🌀",
                    title: pick("Gema Salah Paham", "Echo of Misunderstanding"),
                    description: pick(
                      "Menghilangkan seluruh energi Ikatan.",
                      "Removes all Bond Energy.",
                    ),
                  },
                  {
                    symbol: "👤",
                    title: pick("Bayangan Sepi", "Shadow of Loneliness"),
                    description: pick(
                      "Pemburu bergerak setiap giliran dan melukai pemain yang tertangkap.",
                      "The hunter moves every round and harms a player it catches.",
                    ),
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-xl border border-rose-300/10 bg-rose-300/[0.035] p-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-300/10 text-lg">
                      {item.symbol}
                    </span>

                    <div>
                      <strong className="block text-xs text-zinc-200">
                        {item.title}
                      </strong>
                      <p className="mt-1 text-[11px] leading-4 text-zinc-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[10px] font-black tracking-[0.18em] text-cyan-300">
                {pick("STATUS PERJALANAN", "JOURNEY STATUS")}
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {[
                  {
                    symbol: "♥",
                    title: pick("Hati", "Hearts"),
                    description: pick(
                      "Daya tahan pemain. Permainan berakhir jika mencapai nol.",
                      "A player's health. The game ends if it reaches zero.",
                    ),
                  },
                  {
                    symbol: "🕯️",
                    title: pick("Cahaya", "Light"),
                    description: pick(
                      "Batas perjalanan; berkurang setiap kali melangkah.",
                      "The journey limit; reduced with every attempted step.",
                    ),
                  },
                  {
                    symbol: "💞",
                    title: pick("Ikatan", "Bond"),
                    description: pick(
                      "Energi untuk memakai skill. Kapasitas awal 5; Inti Ikatan dapat menaikkannya hingga 9.",
                      "Energy used for skills. Starting capacity is 5; Bond Core can raise it to 9.",
                    ),
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-xl border border-cyan-300/10 bg-cyan-300/[0.035] p-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-lg">
                      {item.symbol}
                    </span>

                    <div>
                      <strong className="block text-xs text-zinc-200">
                        {item.title}
                      </strong>
                      <p className="mt-1 text-[11px] leading-4 text-zinc-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </div>

        <div className="space-y-5">
          <DangerResultPanel room={room} />
          {game.phase === "skill-choice" ? (
            <SkillChoicePanel
              room={room}
              busy={busy}
              onChoose={(skillId) =>
                void performAction("maze-choose-skill", { skillId })
              }
            />
          ) : game.phase === "danger" ? (
            <DangerPanel
              room={room}
              busy={busy}
              onResolve={(skillId) =>
                void performAction("maze-resolve-danger", { skillId })
              }
            />
          ) : game.phase === "boss" ? (
            <BossPanel
              room={room}
              busy={busy}
              onProtect={(protection) =>
                void performAction("maze-boss-protect", { protection })
              }
            />
          ) : yourTurn ? (
            <section className="rounded-[2rem] border border-cyan-300/25 bg-cyan-300/[0.07] p-6">
              <p className="text-xs font-black tracking-[0.18em] text-cyan-200">
                {pick("KAMU BERJALAN", "YOU ARE TRAVELING")}
              </p>
              <h2 className="mt-2 text-2xl font-black">
                {pick("Seberapa jauh kamu percaya?", "How far do you trust the route?")}
              </h2>
              {game.route ? (
                <>
                  <div className="mt-5 flex justify-center gap-2 rounded-2xl border border-cyan-200/15 bg-black/20 p-4">
                    {game.route.directions.map((direction, index) => (
                      <span
                        key={`${direction}-${index}`}
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300/10 text-2xl text-cyan-100"
                      >
                        {DIRECTION_UI[direction].arrow}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 grid gap-2">
                    {game.route.directions.map((_, index) => {
                      const steps = index + 1;
                      const labels = [
                        pick("Langkah aman", "One careful step"),
                        pick("Percaya padamu", "I trust you"),
                        pick("Percaya penuh", "Full trust"),
                      ];
                      return (
                        <button
                          key={steps}
                          type="button"
                          disabled={busy || !game.canWalkRoute}
                          onClick={() =>
                            void performAction("maze-walk-route", {
                              trustSteps: steps,
                            })
                          }
                          className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-left font-bold text-cyan-100 hover:bg-cyan-300/20 disabled:opacity-40"
                        >
                          {labels[index]}
                          <span className="ml-2 text-xs font-normal text-cyan-100/60">
                            {pick("Jalankan", "Follow")} {steps}{" "}
                            {pick("arah", steps === 1 ? "direction" : "directions")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="mt-5 rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-zinc-500">
                  {pick("Menunggu", "Waiting for")} {playerName(room, otherRole(room.you))}{" "}
                  {pick(
                    "membaca peta dan mengirim rute…",
                    "to read the map and send a route…",
                  )}
                </p>
              )}
            </section>
          ) : (
            <>
              {game.route?.from === room.you ? (
                <section className="rounded-[2rem] border border-violet-300/25 bg-violet-300/[0.07] p-6 text-center">
                  <p className="text-xs font-black tracking-[0.18em] text-violet-200">
                    {pick("RUTE TERKIRIM", "ROUTE SENT")}
                  </p>
                  <div className="mt-5 flex justify-center gap-2">
                    {game.route.directions.map((direction, index) => (
                      <span
                        key={`${direction}-${index}`}
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-300/10 text-2xl text-violet-100"
                      >
                        {DIRECTION_UI[direction].arrow}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-zinc-400">
                    {pick("Menunggu", "Waiting for")} {playerName(room, game.turn)}{" "}
                    {pick(
                      "menentukan seberapa jauh ia percaya.",
                      "to decide how far to trust the route.",
                    )}
                  </p>
                </section>
              ) : (
                <RoutePlanner
                  busy={busy}
                  onSend={(directions) =>
                    void performAction("maze-plan-route", { directions })
                  }
                />
              )}
              <InventoryPanel
                room={room}
                busy={busy}
                onUse={(skillId) =>
                  void performAction("maze-use-skill", { skillId })
                }
              />
            </>
          )}

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black tracking-[0.16em] text-zinc-500">
                {pick("CATATAN PETUALANGAN", "JOURNEY LOG")}
              </p>
              <span className="text-xs text-zinc-600">
                {game.damagePrevented} {pick("perlindungan", "protections")}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {game.history.slice(0, 5).map((item, index) => (
                <div
                  key={`${item.kind}-${index}-${item.message}`}
                  className="flex gap-3 text-sm"
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-300/50" />
                  <p className="leading-5 text-zinc-400">
                    {localizeMazeHistoryText(item.message, locale)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <ErrorMessage message={error} />
      <button
        type="button"
        onClick={leaveRoom}
        className="mt-8 block w-full text-center text-sm text-zinc-600 hover:text-white"
      >
        {pick("Keluar dari petualangan", "Leave the journey")}
      </button>
    </Shell>
  );
}
