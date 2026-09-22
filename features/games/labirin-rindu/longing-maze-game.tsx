"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useState,
} from "react";

import type { PlayerRole } from "@/features/platform/room/types";

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
  type MazeSkillDefinition,
  type MazeSkillId,
} from "./rpg-content";
import { useLongingMazeRoom } from "./use-longing-maze-room";

const DIRECTION_UI: Record<
  MazeDirection,
  { arrow: string; label: string }
> = {
  up: { arrow: "↑", label: "Atas" },
  right: { arrow: "→", label: "Kanan" },
  down: { arrow: "↓", label: "Bawah" },
  left: { arrow: "←", label: "Kiri" },
};

function Shell({ children }: { children: ReactNode }) {
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
            ← Katalog
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
  return message ? (
    <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
      {message}
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
  const content = (
    <div className="mt-5 border-t border-white/10 pt-5">
      <section className="rounded-2xl border border-rose-300/15 bg-gradient-to-br from-rose-300/[0.09] to-violet-300/[0.05] p-5">
        <p className="text-[10px] font-black tracking-[0.18em] text-rose-200">
          CERITA KALIAN
        </p>

        <h3 className="mt-2 text-lg font-black text-white">
          Kabut Rindu memisahkan kalian.
        </h3>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Kamu masih dapat melihat dinding di dekatmu,
          tetapi tidak dapat melihat bahaya yang sedang
          memburumu. Hanya pasanganmu yang dapat melihat
          ancaman itu dan menuntunmu. Temukan dua Fragmen
          Hati, bersatu kembali di pusat labirin, lalu
          lindungi satu sama lain dari Badai Pemisah.
        </p>
      </section>

      <section className="mt-6">
        <p className="text-[10px] font-black tracking-[0.18em] text-cyan-200">
          SATU GILIRAN BERJALAN SEPERTI INI
        </p>

        <div className="mt-3 space-y-3">
          <div className="flex gap-4 rounded-2xl border border-violet-300/15 bg-violet-300/[0.06] p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-300/15 text-xs font-black text-violet-100">
              1
            </span>

            <div>
              <strong className="text-sm text-white">
                Penjaga membaca peta pasangan
              </strong>

              <p className="mt-1 text-xs leading-5 text-zinc-400">
                Jika kartumu bertuliskan{" "}
                <b className="text-violet-100">
                  Menjadi penjaga
                </b>
                , lihat dinding dan bahaya di sekitar
                pasangan. Tekan 1–3 tombol arah, lalu tekan{" "}
                <b className="text-white">
                  Kirim langkah
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
                Pejalan menentukan seberapa jauh ia percaya
              </strong>

              <p className="mt-1 text-xs leading-5 text-zinc-400">
                Jika kartumu bertuliskan{" "}
                <b className="text-cyan-100">
                  Sedang berjalan
                </b>
                , tunggu rute masuk. Lalu tekan{" "}
                <b className="text-white">
                  Jalankan 1 arah
                </b>
                ,{" "}
                <b className="text-white">
                  2 arah
                </b>
                , atau{" "}
                <b className="text-white">
                  3 arah
                </b>
                . Pion bergerak otomatis sesuai urutan.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-300/15 text-xs font-black text-amber-100">
              3
            </span>

            <div>
              <strong className="text-sm text-white">
                Selesaikan akibat perjalanan
              </strong>

              <p className="mt-1 text-xs leading-5 text-zinc-400">
                Jika arah pertama menabrak dinding, seluruh
                sisa rute dibatalkan. Jika menginjak bahaya,
                hanya penjaga yang melihat jenisnya dan
                memilih skill perlindungan atau tombol{" "}
                <b className="text-white">
                  Hadapi tanpa skill
                </b>
                . Setelah selesai, peran bertukar.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="text-[10px] font-black tracking-[0.16em] text-zinc-500">
            CONTOH SATU GILIRAN
          </p>

          <p className="mt-2 text-xs leading-5 text-zinc-400">
            Penjaga mengirim{" "}
            <b className="text-white">↑ → →</b>. Pejalan
            memilih{" "}
            <b className="text-white">
              Jalankan 2 arah
            </b>
            . Pion mencoba ↑ lalu →. Jika keduanya berhasil,
            pion maju dua petak dan kalian memperoleh{" "}
            <b className="text-violet-200">
              +1 Ikatan
            </b>
            .
          </p>
        </div>
      </section>

      <section className="mt-6">
        <p className="text-[10px] font-black tracking-[0.18em] text-amber-200">
          MISI PERJALANAN
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: "🔮",
              title: "Cari kekuatan",
              text:
                "Masuki altar untuk memilih satu skill. " +
                "Ada 12 altar, tetapi kalian tidak wajib " +
                "mengambil semuanya.",
            },
            {
              icon: "💎",
              title: "Bawa satu fragmen",
              text:
                "Siapa pun boleh mengambil fragmen mana pun. " +
                "Jika kamu sudah membawa satu, sisakan " +
                "fragmen lainnya untuk pasangan.",
            },
            {
              icon: "💗",
              title: "Bertemu di pusat",
              text:
                "Setelah indikator mencapai 2/2 Fragmen, " +
                "berdirilah bersama di pusat untuk memulai " +
                "pertarungan boss.",
            },
          ].map((mission) => (
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
          TIGA HAL YANG HARUS DIJAGA
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-rose-300/10 bg-rose-300/[0.04] p-4">
            <strong className="text-sm text-rose-100">
              ♥ Hati
            </strong>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Nyawa masing-masing pemain. Jika salah satu
              mencapai nol, kalian kalah.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-300/10 bg-amber-300/[0.04] p-4">
            <strong className="text-sm text-amber-100">
              🕯️ Cahaya
            </strong>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Waktu perjalanan bersama. Setiap arah yang
              dicoba menghabiskan satu Cahaya, termasuk saat
              menabrak dinding.
            </p>
          </div>

          <div className="rounded-2xl border border-violet-300/10 bg-violet-300/[0.04] p-4">
            <strong className="text-sm text-violet-100">
              💞 Ikatan
            </strong>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Energi skill, maksimal lima. Rute sukses 2 arah
              memberi +1; 3 arah memberi +2; mengambil
              fragmen memberi +1.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/[0.06] p-5">
        <p className="text-[10px] font-black tracking-[0.18em] text-fuchsia-200">
          PERTARUNGAN TERAKHIR
        </p>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Badai Pemisah berlangsung tiga gelombang. Pada
          setiap gelombang, kamu melihat serangan yang menuju
          pasanganmu. Pilih skill yang cocok, gunakan{" "}
          <b className="text-violet-100">
            Perisai Ikatan
          </b>{" "}
          seharga 2 Ikatan, atau pilih{" "}
          <b className="text-white">
            Bertahan tanpa perlindungan
          </b>
          . Kalian menang setelah selamat dari gelombang
          ketiga.
        </p>
      </section>

      <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs leading-5 text-zinc-500">
        Catatan: petak 🔒 tetap dapat dilewati sebelum
        fragmen lengkap. Inventaris hanya menyimpan empat
        skill; mengambil skill kelima akan menggantikan skill
        yang paling lama.
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
              Cara bermain
            </strong>

            <span className="text-xs text-zinc-500">
              Baca cerita dan ikuti satu giliran langkah demi
              langkah
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
            RPG CINTA TERBALIK
          </p>

          <h2 className="mt-1 text-xl font-black">
            Kamu adalah penjaga pasanganmu
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
              aria-label={`Petak ${cell.x + 1}, ${cell.y + 1}`}
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
                  title="Fragmen Hati — setiap pemain dapat membawa satu"
                  className="absolute text-xs drop-shadow-[0_0_8px_rgba(253,224,71,0.7)] sm:text-lg"
                >
                  💎
                </span>
              )}
              {cell.special === "danger" && cell.danger && (
                <span
                  title={cell.danger.name}
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
                      )}${room.you === role ? " · Pionmu" : ""}`}
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
        <span>💗 Titik temu</span>
        <span>💎 Fragmen</span>
        <span>🔮 Altar skill</span>
        <span>👤 Pemburu</span>
        <span>Bahaya hanya terlihat oleh penjaga</span>
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
        aria-label={`Tambah langkah ke ${item.label.toLowerCase()}`}
        className={`group ${placement} ${shape} relative flex h-16 w-16 touch-manipulation select-none flex-col items-center justify-center border border-violet-200/25 bg-gradient-to-b from-violet-300/20 to-violet-500/10 text-violet-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_22px_rgba(0,0,0,0.28)] transition duration-150 hover:border-violet-200/45 hover:from-violet-300/30 hover:to-violet-500/20 active:scale-90 active:bg-violet-400/30 disabled:cursor-not-allowed disabled:opacity-30`}
      >
        <span className="text-2xl font-black leading-none transition-transform group-hover:scale-110">
          {item.arrow}
        </span>

        <span className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-violet-200/60">
          {item.label}
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
              langkah
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
        Tekan arah untuk menyusun maksimal 3 langkah
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
  const [route, setRoute] = useState<MazeDirection[]>([]);

  function add(direction: MazeDirection) {
    setRoute((current) =>
      current.length >= 3 ? current : [...current, direction],
    );
  }

  return (
    <section className="rounded-[2rem] border border-violet-300/25 bg-violet-300/[0.07] p-6">
      <p className="text-xs font-black tracking-[0.18em] text-violet-200">
        KAMU MENJAGA
      </p>
      <h2 className="mt-2 text-2xl font-black">Susun rute pasanganmu.</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        Kamu melihat dinding dan bahaya di dekat pasanganmu. Semua arah boleh dikirim—periksa petanya dengan teliti.
      </p>
      <div className="mt-5 flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 p-3">
        {route.length === 0 ? (
          <span className="text-sm text-zinc-600">Belum ada arah</span>
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
          Hapus
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
          Kirim {route.length || ""} langkah
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
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-violet-300/30 hover:bg-violet-300/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{skill.emoji}</span>
        <span className="min-w-0 flex-1">
          <strong className="block text-sm">{skill.name}</strong>
          <span className="mt-1 block text-xs leading-5 text-zinc-500">
            {skill.description}
          </span>
          <span className="mt-2 block text-[11px] font-bold text-violet-300">
            {actionLabel} · {skill.cost} Ikatan
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
  const game = room.game;
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.16em] text-zinc-500">
            SKILL PENJAGA
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            Selalu digunakan untuk pasanganmu
          </p>
        </div>
        <span className="rounded-full bg-violet-300/10 px-3 py-1 text-xs text-violet-200">
          {game.inventory.length}/4
        </span>
      </div>
      {game.inventory.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-white/10 p-4 text-sm text-zinc-600">
          Jelajahi altar 🔮 untuk mendapatkan skill.
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
              actionLabel="Gunakan"
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
              ? "Sedang berjalan"
              : "Menjadi penjaga"}
          </p>
        </div>

        <span
          title={
            state.fragment
              ? "Fragmen Hati sudah ditemukan"
              : "Fragmen Hati belum ditemukan"
          }
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold sm:text-xs ${
            state.fragment
              ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
              : "border-white/10 bg-white/[0.035] text-zinc-500"
          }`}
        >
          {state.fragment ? "💎 Didapat" : "◇ Belum"}
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
          {state.skillCount} skill
        </span>
      </div>

      <div className="mt-3 border-t border-white/[0.06] pt-3">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">
          Skill terkumpul
        </p>

        {state.skills.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {state.skills.map((skill, index) => (
              <span
                key={`${skill.id}-${index}`}
                title={`${skill.description} Biaya: ${skill.cost} Ikatan.`}
                className="inline-flex items-center gap-1 rounded-lg border border-violet-300/15 bg-violet-300/[0.07] px-2 py-1 text-[10px] leading-4 text-violet-100"
              >
                <span>{skill.emoji}</span>
                <span>{skill.name}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-zinc-600">
            Belum memiliki skill.
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
  const choice = room.game.pendingSkill;
  if (!choice) return null;
  if (!choice.options) {
    return (
      <section className="rounded-[2rem] border border-violet-300/25 bg-violet-300/[0.07] p-6 text-center">
        <div className="text-4xl">🔮</div>
        <h2 className="mt-4 text-xl font-black">
          {playerName(room, choice.forRole)} menemukan Altar Ikatan
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Pasanganmu sedang memilih kekuatan untuk menjagamu nanti.
        </p>
      </section>
    );
  }
  return (
    <section className="rounded-[2rem] border border-violet-300/30 bg-violet-300/[0.08] p-6">
      <div className="text-4xl">🔮</div>
      <p className="mt-4 text-xs font-black tracking-[0.18em] text-violet-200">
        ALTAR IKATAN
      </p>
      <h2 className="mt-2 text-2xl font-black">Pilih satu skill penjaga.</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Skill ini tidak dapat menyelamatkanmu sendiri. Simpan untuk melindungi pasanganmu.
      </p>
      <div className="mt-5 grid gap-3">
        {choice.options.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            disabled={busy}
            actionLabel="Ambil skill"
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
  const encounter = room.game.pendingDanger;

  if (!encounter?.danger) {
    return null;
  }

  const danger = encounter.danger;

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
              KAMU MENGINJAK BAHAYA
            </p>

            <h2 className="mt-2 text-2xl font-black">
              {danger.name}
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {danger.description}
            </p>

            <p className="mt-2 text-sm font-semibold text-red-100">
              Jika tidak dicegah: {danger.consequence}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.07] p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🛡️</span>

            <div>
              <p className="text-xs font-black tracking-[0.14em] text-emerald-200">
                PASANGANMU SEDANG BERTINDAK
              </p>

              <p className="mt-1 text-sm leading-6 text-zinc-400">
                {playerName(
                  room,
                  otherRole(encounter.target),
                )} sedang memilih cara untuk melindungimu.
                Setelah keputusan dibuat, kamu akan melihat
                perlindungan yang benar-benar digunakan.
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
            PASANGANMU TERANCAM
          </p>

          <h2 className="mt-2 text-2xl font-black">
            {danger.name}
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {danger.description}
          </p>

          <p className="mt-2 text-sm font-semibold text-red-100">
            Jika tidak dicegah: {danger.consequence}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {counters.map((skill, index) => (
          <SkillCard
            key={`${skill.id}-${index}`}
            skill={skill}
            disabled={busy}
            actionLabel="Lindungi sekarang"
            onClick={() => onResolve(skill.id)}
          />
        ))}

        {counters.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm leading-6 text-zinc-500">
            Kamu belum memiliki skill yang cocok.
            Bahaya tetap dapat diselesaikan, tetapi pasanganmu
            akan menerima akibatnya.
          </p>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => onResolve()}
          className="rounded-2xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm font-bold text-red-100 hover:bg-red-300/20 disabled:opacity-40"
        >
          Hadapi tanpa skill
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
  const result =
    room.game.history[0]?.dangerResolution;

  if (!result || result.target !== room.you) {
    return null;
  }

  const protectorName = playerName(
    room,
    result.protector,
  );

  const danger = getMazeDanger(result.danger);

  const protection = result.skillId
    ? getMazeSkill(result.skillId)
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
              ? "KAMU BERHASIL DILINDUNGI"
              : "BAHAYA MENGENAIMU"}
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
            PERLINDUNGAN DARI{" "}
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
                Akibat “{danger.consequence}” berhasil
                dibatalkan.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-amber-300/20 bg-black/20 p-4">
          <p className="text-xs font-black tracking-[0.14em] text-amber-200">
            TANPA SKILL PERLINDUNGAN
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {protectorName} tidak menggunakan skill untuk
            menahan bahaya ini. Akibat yang diterima:{" "}
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
  const boss = room.game.boss;
  if (!boss) return null;
  const danger = boss.attackOnPartner;
  const skills = room.game.inventory.filter((skill) =>
    boss.usableSkillIds.includes(skill.id),
  );
  return (
    <section className="rounded-[2rem] border border-fuchsia-300/30 bg-gradient-to-b from-fuchsia-400/10 to-red-400/[0.06] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-[0.18em] text-fuchsia-200">
            BADAI PEMISAH · GELOMBANG {boss.round}/{boss.totalRounds}
          </p>
          <h2 className="mt-2 text-2xl font-black">
            Lindungi pasanganmu.
          </h2>
        </div>
        <span className="text-4xl">🌪️</span>
      </div>
      {danger && (
        <div className="mt-5 rounded-2xl border border-red-300/20 bg-black/20 p-4">
          <p className="text-xs font-bold text-red-200">SERANGAN YANG KAMU LIHAT</p>
          <p className="mt-2 text-lg font-black">
            {danger.emoji} {danger.name}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Mengarah ke {playerName(room, room.you ? otherRole(room.you) : "guest")}.
          </p>
        </div>
      )}
      {boss.submittedYou ? (
        <p className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5 text-center text-sm text-zinc-400">
          Perlindunganmu sudah siap. Menunggu pasangan memilih…
        </p>
      ) : (
        <div className="mt-5 grid gap-3">
          {skills.map((skill, index) => (
            <SkillCard
              key={`${skill.id}-${index}`}
              skill={skill}
              disabled={busy}
              actionLabel="Gunakan melawan badai"
              onClick={() => onProtect(skill.id)}
            />
          ))}
          <button
            type="button"
            disabled={busy || !boss.canUseBond}
            onClick={() => onProtect("bond")}
            className="rounded-2xl border border-violet-300/25 bg-violet-300/10 px-4 py-3 text-left font-bold text-violet-100 disabled:opacity-40"
          >
            💞 Perisai Ikatan
            <span className="mt-1 block text-xs font-normal text-zinc-400">
              Perlindungan universal · membutuhkan 2 Ikatan
            </span>
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onProtect("endure")}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 disabled:opacity-40"
          >
            Bertahan tanpa perlindungan
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
  const missions = [
    {
      icon: "🧭",
      title: "Percayai pasanganmu",
      text: "Saat kamu berjalan, pasanganmu melihat bahaya yang tidak dapat kamu lihat dan menunjukkan arah yang aman.",
    },
    {
      icon: "🛡️",
      title: "Lindungi satu sama lain",
      text: "Kamu tidak dapat melindungi dirimu sendiri. Hanya kamu yang dapat melindungi pasanganmu ketika bahaya menyerang.",
    },
    {
      icon: "🔮",
      title: "Persiapkan bekal",
      text: "Singgahi altar selama perjalanan untuk memperoleh skill dan memperkuat Ikatan kalian.",
    },
    {
      icon: "💗",
      title: "Hadapi pertarungan terakhir",
      text: "Temukan dua Fragmen Hati, buka pintu di pusat labirin, lalu hadapi Badai Pemisah bersama.",
    },
  ];

  return (
    <Shell>
      <section className="mx-auto mt-10 max-w-4xl rounded-[2rem] border border-rose-300/20 bg-gradient-to-b from-rose-300/[0.09] to-violet-300/[0.04] p-6 text-center shadow-2xl shadow-black/30 sm:p-10">
        <div className="text-5xl">🕯️ 🌫️ 🕯️</div>

        <p className="mt-6 text-xs font-black tracking-[0.22em] text-rose-300">
          PROLOG · LABIRIN RINDU
        </p>

        <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
          Kalian terpisah di dalam labirin.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
          Ketika kabut turun, kalian terbangun di lorong yang berbeda.
          Carilah jalan untuk kembali bertemu, tetapi jangan berjalan
          sendirian. Bahaya yang tidak dapat kamu lihat justru terlihat
          oleh pasanganmu.
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
            Percayalah kepada pasanganmu.
          </strong>

          <p className="mt-1 text-xs leading-5 text-zinc-400">
            Dengarkan petunjuknya ketika kamu berjalan. Saat giliranmu
            menjaga, keselamatan pasanganmu berada di tanganmu.
          </p>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-7 w-full rounded-2xl bg-gradient-to-r from-violet-500 via-pink-500 to-rose-500 px-6 py-4 font-black shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]"
        >
          Aku siap mempercayai pasangan
        </button>
      </section>
    </Shell>
  );
}

export default function LongingMazeGame() {
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
          <p className="mt-5 text-zinc-400">Menyalakan Cahaya Ikatan…</p>
        </div>
      </Shell>
    );
  }

  if (!room) {
    return (
      <Shell>
        <header className="mt-14 max-w-4xl">
          <p className="text-xs font-black tracking-[0.24em] text-rose-300">
            LABIRIN RINDU · PENJAGA HATI
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
            Bahayamu terlihat oleh dia. Bahayanya terlihat olehmu.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            Jelajahi labirin 7×7, temukan skill, lindungi pasangan dari bahaya yang tidak dapat mereka lihat, dan hadapi Badai Pemisah bersama.
          </p>
          <div className="mt-7 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-rose-100">
              🛡️ RPG kooperatif
            </span>
            <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-violet-100">
              🔮 9 skill
            </span>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-cyan-100">
              💗 15–20 menit
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
              MULAI PETUALANGAN
            </p>
            <label
              htmlFor="maze-create-name"
              className="mt-6 block text-sm font-medium text-zinc-300"
            >
              Nama panggilanmu
            </label>
            <input
              id="maze-create-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              maxLength={20}
              required
              placeholder="Misalnya: Ara"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 outline-none focus:border-rose-400/50"
            />
            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full rounded-2xl bg-rose-500 px-5 py-3.5 font-bold hover:bg-rose-400 disabled:opacity-50"
            >
              {busy ? "Membuka labirin…" : "Buat room & undang pasangan"}
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
              htmlFor="maze-room-code"
              className="mt-6 block text-sm font-medium text-zinc-300"
            >
              Kode room
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
              Buka room
            </button>
            <p className="mt-8 rounded-2xl border border-white/5 bg-black/10 p-4 text-sm leading-6 text-zinc-500">
              Setiap room mendapatkan labirin, bahaya, altar, dan kombinasi skill baru.
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
            PANGGILAN PENJAGA
          </p>
          <h1 className="mt-4 text-3xl font-black">
            {room.players.host} membutuhkanmu di dalam labirin.
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            Room <strong className="font-mono text-white">{room.code}</strong>
          </p>
          <div className="mt-7 text-left">
            <GameInstructions compact />
          </div>
          {roomFull ? (
            <p className="mt-8 rounded-2xl bg-black/20 p-4 text-zinc-300">
              Room ini sudah memiliki dua penjaga.
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
                Nama panggilanmu
              </label>
              <input
                id="maze-join-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={20}
                required
                placeholder="Misalnya: Bima"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 outline-none focus:border-rose-400/50"
              />
              <button
                type="submit"
                disabled={busy}
                className="mt-4 w-full rounded-2xl bg-rose-500 px-5 py-3.5 font-bold hover:bg-rose-400 disabled:opacity-50"
              >
                {busy ? "Memasuki labirin…" : "Jaga pasanganmu"}
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
        <section className="mx-auto mt-16 max-w-2xl rounded-[2rem] border border-rose-300/25 bg-white/[0.045] p-8 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-400/10 text-3xl">
            🕯️
          </div>
          <p className="mt-7 text-xs font-bold tracking-[0.2em] text-zinc-500">
            MENUNGGU PENJAGA KEDUA
          </p>
          <h1 className="mt-3 font-mono text-4xl font-black tracking-[0.14em] sm:text-5xl">
            {room.code}
          </h1>
          <p className="mx-auto mt-5 max-w-sm text-zinc-400">
            Bagikan tautannya. Petualangan dimulai setelah pasanganmu bergabung.
          </p>
          <button
            type="button"
            onClick={() => void copyInvite()}
            className="mt-8 rounded-2xl bg-rose-500 px-7 py-3.5 font-bold hover:bg-rose-400"
          >
            {copied ? "Tautan tersalin ✓" : "Salin tautan undangan"}
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
        {lost && (
          <MazeFailureScene
            key={`${room.code}-maze-failed`}
            reason={
              game.history.find(
                (item) => item.kind === "lost",
              )?.message ??
              "Cahaya terakhir padam sebelum perjalanan selesai."
            }
          />
        )}
        <section className="mx-auto mt-14 max-w-3xl rounded-[2rem] border border-rose-300/20 bg-gradient-to-b from-rose-400/10 to-white/[0.03] p-8 text-center sm:p-12">
          <div className="text-6xl">{won ? "💞" : "🌫️"}</div>
          <p className="mt-6 text-xs font-bold tracking-[0.2em] text-rose-300">
            {won ? "BADAI TELAH REDA" : "PERJALANAN TERHENTI"}
          </p>
          <h1 className="mt-3 text-4xl font-black">
            {won
              ? "Kalian menjadi pelindung satu sama lain."
              : "Labirin menang kali ini."}
          </h1>
          <p className="mx-auto mt-4 max-w-lg leading-7 text-zinc-400">
            {won
              ? "Bukan kekuatan sendiri yang membawa kalian pulang, melainkan keputusan untuk saling menjaga sampai akhir."
              : "Coba susun rute yang lebih hati-hati, jelajahi lebih banyak altar, dan simpan skill yang tepat untuk boss."}
          </p>
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [result.hearts, "Hati tersisa"],
              [result.protected, "Bahaya ditahan"],
              [result.skillsUsed, "Skill dipakai"],
              [`${result.efficiency}%`, "Efisiensi"],
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
              Mulai petualangan baru
            </button>
          ) : (
            <p className="mt-8 text-sm text-zinc-500">
              {room.players.host} dapat membuka labirin baru…
            </p>
          )}
          <button
            type="button"
            onClick={leaveRoom}
            className="mt-6 block w-full text-sm text-zinc-500 hover:text-white"
          >
            Kembali ke awal game
          </button>
          <ErrorMessage message={error} />
        </section>
      </Shell>
    );
  }

  const yourTurn = room.you === game.turn;

  return (
    <Shell>
      {won && (
        <MazeFinishCelebration
          key={`${room.code}-maze-finished`}
          hostName={room.players.host}
          guestName={
            room.players.guest ?? "Pasangan"
          }
        />
      )}

      <header className="mt-9 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-[0.2em] text-rose-300">
            ROOM {room.code} · RONDE {game.round}
          </p>
          <h1 className="mt-2 text-3xl font-black">
            Labirin Rindu: Penjaga Hati
          </h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-amber-100">
              🕯️ {game.light}/{game.maxLight}
            </span>
            <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-violet-100">
              💞 {game.bond}/{game.maxBond} Ikatan
            </span>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-cyan-100">
              🔮 {game.claimedAltars}/{game.totalAltars} altar
            </span>
            <span className="rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-rose-100">
              💎{" "}
              {Number(game.playerState.host.fragment) +
                Number(game.playerState.guest.fragment)}
              /2 Fragmen
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void copyInvite()}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300 hover:bg-white/10"
        >
          {copied ? "Tersalin ✓" : "Undang"}
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
                PETA PERLINDUNGAN
              </p>
              <p className="mt-1 text-sm text-zinc-300">
                Dinding dan bahaya di dekat pasanganmu terlihat di sini.
              </p>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-zinc-400">
              {game.movesUsed} langkah
            </span>
          </div>
          {room.you && (
            <div className="mb-4 flex justify-end">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] text-zinc-400">
                <span className="h-2.5 w-2.5 rounded-full border border-white bg-violet-200 shadow-[0_0_8px_rgba(255,255,255,0.9),0_0_14px_rgba(196,181,253,0.65)]" />
                Halo putih menandai pionmu
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
                  Legenda simbol
                </strong>
                <span className="text-xs text-zinc-500">
                  Tekan untuk melihat arti petak, bahaya, dan status
                </span>
              </span>

              <span className="text-zinc-500 transition-transform group-open:rotate-180">
                ⌄
              </span>
            </summary>

            <div className="border-t border-white/10 p-4">
              <p className="text-[10px] font-black tracking-[0.18em] text-violet-300">
                PETA LABIRIN
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  {
                    symbol: "💗",
                    title: "Titik temu terbuka",
                    description:
                      "Tujuan akhir setelah kedua Fragmen Hati ditemukan.",
                  },
                  {
                    symbol: "🔒",
                    title: "Titik temu terkunci",
                    description:
                      "Belum dapat dimasuki karena fragmen belum lengkap.",
                  },
                  {
                    symbol: "💎",
                    title: "Fragmen Hati",
                    description:
                      "Siapa pun boleh mengambilnya, tetapi setiap pemain hanya dapat membawa satu.",
                  },
                  {
                    symbol: "🔮",
                    title: "Altar Ikatan",
                    description:
                      "Memberikan pilihan skill untuk melindungi pasangan.",
                  },
                  {
                    symbol: "✦",
                    title: "Altar telah digunakan",
                    description:
                      "Skill dari altar ini sudah diambil.",
                  },
                  {
                    symbol: "🔵",
                    title: "Pion host",
                    description:
                      "Posisi pemain yang membuat room.",
                  },
                  {
                    symbol: "🩷",
                    title: "Pion pasangan",
                    description:
                      "Posisi pemain yang bergabung ke room.",
                  },
                  {
                    symbol: "•",
                    title: "Jejak perjalanan",
                    description:
                      "Petak yang pernah dilewati oleh pemain.",
                  },
                  {
                    symbol: "·",
                    title: "Kabut belum dipetakan",
                    description:
                      "Area yang belum terlihat oleh kedua pemain.",
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
                BAHAYA
              </p>

              <p className="mt-2 text-xs leading-5 text-zinc-500">
                Bahaya di dekatmu hanya terlihat oleh pasanganmu.
                Dengarkan petunjuk pasangan sebelum berjalan.
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  {
                    symbol: "🌹",
                    title: "Duri Sunyi",
                    description:
                      "Mengurangi satu Hati jika tidak dilindungi.",
                  },
                  {
                    symbol: "🌫️",
                    title: "Kabut Ragu",
                    description:
                      "Memadamkan tiga Cahaya perjalanan.",
                  },
                  {
                    symbol: "🌊",
                    title: "Gelombang Jarak",
                    description:
                      "Mundur satu petak dan kehilangan satu Hati.",
                  },
                  {
                    symbol: "🌀",
                    title: "Gema Salah Paham",
                    description:
                      "Menghilangkan seluruh energi Ikatan.",
                  },
                  {
                    symbol: "👤",
                    title: "Bayangan Sepi",
                    description:
                      "Pemburu bergerak setiap giliran dan melukai pemain yang tertangkap.",
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
                STATUS PERJALANAN
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {[
                  {
                    symbol: "♥",
                    title: "Hati",
                    description:
                      "Daya tahan pemain. Permainan berakhir jika mencapai nol.",
                  },
                  {
                    symbol: "🕯️",
                    title: "Cahaya",
                    description:
                      "Batas perjalanan; berkurang setiap kali melangkah.",
                  },
                  {
                    symbol: "💞",
                    title: "Ikatan",
                    description:
                      "Energi untuk memakai skill. Kapasitas awal 5; Inti Ikatan dapat menaikkannya hingga 9.",
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
                KAMU BERJALAN
              </p>
              <h2 className="mt-2 text-2xl font-black">Seberapa jauh kamu percaya?</h2>
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
                        "Langkah aman",
                        "Percaya kamu",
                        "Percaya penuh",
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
                            Jalankan {steps} arah
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="mt-5 rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-zinc-500">
                  Menunggu {playerName(room, otherRole(room.you))} membaca peta dan mengirim rute…
                </p>
              )}
            </section>
          ) : (
            <>
              {game.route?.from === room.you ? (
                <section className="rounded-[2rem] border border-violet-300/25 bg-violet-300/[0.07] p-6 text-center">
                  <p className="text-xs font-black tracking-[0.18em] text-violet-200">
                    RUTE TERKIRIM
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
                    Menunggu {playerName(room, game.turn)} menentukan seberapa jauh ia percaya.
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
                CATATAN PETUALANGAN
              </p>
              <span className="text-xs text-zinc-600">
                {game.damagePrevented} perlindungan
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {game.history.slice(0, 5).map((item, index) => (
                <div
                  key={`${item.kind}-${index}-${item.message}`}
                  className="flex gap-3 text-sm"
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-300/50" />
                  <p className="leading-5 text-zinc-400">{item.message}</p>
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
        Keluar dari petualangan
      </button>
    </Shell>
  );
}
