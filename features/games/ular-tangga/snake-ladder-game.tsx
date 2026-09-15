"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BoardDecorations } from "@/features/games/ular-tangga/components/board-decorations";
import { FinishCelebration } from "@/features/games/ular-tangga/components/finish-celebration";
import {
  BOARD_CELLS,
  CHALLENGE_POSITIONS,
  LADDERS,
  SNAKES,
  type PlayerRole,
  type RoomView,
} from "@/features/games/ular-tangga/game";
import { SNAKE_LADDER_SLUG } from "@/features/platform/game-registry";

const TOKEN_KEY = "jarak-dadu-player";

type AnimatedPositions = Partial<Record<PlayerRole, number>>;

function wait(duration: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

function positionForRole(room: RoomView, role: PlayerRole) {
  if (role === "host") return room.players.host.position;
  return room.players.guest?.position ?? 1;
}

function nameForRole(room: RoomView, role: PlayerRole) {
  if (role === "host") return room.players.host.name;
  return room.players.guest?.name ?? "Pasangan";
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function readSavedToken(code: string) {
  try {
    return localStorage.getItem(`${TOKEN_KEY}:${code}`) ?? "";
  } catch {
    return "";
  }
}

function saveToken(code: string, token: string) {
  try {
    localStorage.setItem(`${TOKEN_KEY}:${code}`, token);
  } catch {
    // The game still works for the current tab when storage is unavailable.
  }
}

function DiceFace({ value, rolling = false }: { value: number; rolling?: boolean }) {
  const visiblePips: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  return (
    <span className={`dice-face ${rolling ? "is-rolling" : ""}`} aria-hidden="true">
      {Array.from({ length: 9 }, (_, index) => (
        <span
          className={`dice-pip ${visiblePips[value]?.includes(index) ? "is-visible" : ""}`}
          key={index}
        />
      ))}
    </span>
  );
}

function Board({
  room,
  animatedPositions,
  highlightedCell,
  movingRole,
  transitioningRole,
}: {
  room: RoomView;
  animatedPositions: AnimatedPositions;
  highlightedCell: number | null;
  movingRole: PlayerRole | null;
  transitioningRole: PlayerRole | null;
}) {
  const players = [
    {
      role: "host" as const,
      name: room.players.host.name,
      position: animatedPositions.host ?? room.players.host.position,
    },
    room.players.guest
      ? {
          role: "guest" as const,
          name: room.players.guest.name,
          position: animatedPositions.guest ?? room.players.guest.position,
        }
      : null,
  ].filter(Boolean) as Array<{ role: PlayerRole; name: string; position: number }>;

  return (
    <div className="board-wrap">
      <div className="board" role="grid" aria-label="Papan ular tangga 100 petak">
        {BOARD_CELLS.map((cell) => {
          const ladderTo = LADDERS[cell];
          const snakeTo = SNAKES[cell];
          const isChallenge = CHALLENGE_POSITIONS.includes(cell);
          const occupants = players.filter((player) => player.position === cell);

          return (
            <div
              className={`board-cell ${ladderTo ? "has-ladder" : ""} ${
                snakeTo ? "has-snake" : ""
              } ${isChallenge ? "has-challenge" : ""} ${cell === 100 ? "is-finish" : ""} ${
                highlightedCell === cell ? "is-highlighted" : ""
              }`}
              key={cell}
              role="gridcell"
              aria-label={`Petak ${cell}${ladderTo ? `, tangga menuju ${ladderTo}` : ""}${
                snakeTo ? `, ular menuju ${snakeTo}` : ""
              }`}
            >
              <span className="cell-number">{cell}</span>
              {isChallenge && !ladderTo && !snakeTo ? (
                <span className="cell-heart" title="Petak cerita">
                  ♥
                </span>
              ) : null}
              {occupants.length ? (
                <span className={`token-stack count-${occupants.length}`}>
                  {occupants.map((player) => (
                    <span
                      className={`player-token token-${player.role} ${
                        movingRole === player.role ? "is-moving" : ""
                      } ${transitioningRole === player.role ? "is-transitioning" : ""}`}
                      key={player.role}
                      title={`${player.name} di petak ${cell}`}
                    >
                      {initials(player.name)}
                    </span>
                  ))}
                </span>
              ) : null}
            </div>
          );
        })}

        <BoardDecorations />
      </div>
    </div>
  );
}

function PlayerCard({
  role,
  name,
  position,
  active,
  isYou,
}: {
  role: PlayerRole;
  name: string;
  position: number;
  active: boolean;
  isYou: boolean;
}) {
  return (
    <article className={`player-card ${active ? "is-active" : ""}`}>
      <span className={`avatar avatar-${role}`}>{initials(name)}</span>
      <span className="player-copy">
        <span className="player-name">
          {name} {isYou ? <small>kamu</small> : null}
        </span>
        <span className="player-position">Petak {position}</span>
      </span>
      <span className="player-progress" aria-label={`Progres ${position} persen`}>
        <span style={{ width: `${position}%` }} />
      </span>
    </article>
  );
}

function Landing({
  roomCode,
  setRoomCode,
  name,
  setName,
  busy,
  error,
  onCreate,
  onOpenRoom,
}: {
  roomCode: string;
  setRoomCode: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  busy: boolean;
  error: string;
  onCreate: (event: FormEvent) => void;
  onOpenRoom: (event: FormEvent) => void;
}) {
  return (
    <main className="landing-main">
      <section className="landing-copy">
        <span className="eyebrow"><span className="status-dot" /> DATE NIGHT, DI MANA PUN</span>
        <h1>
          Satu dadu.<br />
          Dua kota.<br />
          <span>Banyak cerita.</span>
        </h1>
        <p>
          Ular tangga untuk pasangan yang berjauhan—lengkap dengan petak cerita,
          tantangan kecil, dan ruang privat yang bisa dibuka dari dua perangkat.
        </p>
        <div className="feature-row" aria-label="Fitur utama">
          <span>♥ 2 pemain</span>
          <span>↻ Sinkron otomatis</span>
          <span>✦ Tanpa akun</span>
        </div>
      </section>

      <section className="entry-card" aria-labelledby="entry-title">
        <div className="entry-card-top">
          <span className="mini-board" aria-hidden="true">
            {Array.from({ length: 16 }, (_, index) => <i key={index} />)}
            <b className="mini-token one">♥</b>
            <b className="mini-token two">♥</b>
          </span>
          <span>
            <small>MULAI PERMAINAN</small>
            <h2 id="entry-title">Buat ruang berdua</h2>
          </span>
        </div>

        <form onSubmit={onCreate} className="entry-form">
          <label htmlFor="host-name">Nama panggilanmu</label>
          <div className="input-shell">
            <span aria-hidden="true">☺</span>
            <input
              id="host-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Misalnya: Ara"
              minLength={2}
              maxLength={20}
              autoComplete="nickname"
              required
            />
          </div>
          <button className="primary-button" disabled={busy} type="submit">
            {busy ? "Menyiapkan ruang…" : "Buat ruang & undang dia"}
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <div className="divider"><span>atau sudah punya kode?</span></div>

        <form onSubmit={onOpenRoom} className="code-form">
          <input
            aria-label="Kode ruang"
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            placeholder="KODE RUANG"
            maxLength={8}
          />
          <button type="submit" disabled={busy || roomCode.length < 6}>Gabung</button>
        </form>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <p className="privacy-note"><span>⌁</span> Ruang hanya bisa dibuka dengan kode undangan.</p>
      </section>
    </main>
  );
}

function JoinRoom({
  room,
  name,
  setName,
  busy,
  error,
  onJoin,
  onBack,
}: {
  room: RoomView;
  name: string;
  setName: (value: string) => void;
  busy: boolean;
  error: string;
  onJoin: (event: FormEvent) => void;
  onBack: () => void;
}) {
  const roomFull = Boolean(room.players.guest);

  return (
    <main className="join-main">
      <section className="join-card">
        <button className="text-button back-button" onClick={onBack} type="button">← Kembali</button>
        <div className="invite-orbit" aria-hidden="true">
          <span className="orbit-avatar host-orbit">{initials(room.players.host.name)}</span>
          <span className="orbit-line"><i>♥</i></span>
          <span className="orbit-avatar guest-orbit">?</span>
        </div>
        <span className="eyebrow">UNDANGAN BERMAIN</span>
        <h1>{room.players.host.name} menunggumu.</h1>
        <p>
          Masuk ke ruang <strong>{room.code}</strong> dan mulai perjalanan kecil kalian menuju petak 100.
        </p>

        {roomFull ? (
          <div className="room-full-message">
            <span>●</span>
            <div><strong>Ruang ini sudah lengkap</strong><small>Buka dari perangkat yang sebelumnya dipakai untuk bermain.</small></div>
          </div>
        ) : (
          <form onSubmit={onJoin} className="entry-form join-form">
            <label htmlFor="guest-name">Nama panggilanmu</label>
            <div className="input-shell">
              <span aria-hidden="true">☺</span>
              <input
                id="guest-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Misalnya: Bima"
                minLength={2}
                maxLength={20}
                autoFocus
                required
              />
            </div>
            <button className="primary-button" disabled={busy} type="submit">
              {busy ? "Masuk ke ruang…" : "Gabung & mulai bermain"}
              <span aria-hidden="true">→</span>
            </button>
          </form>
        )}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
      </section>
    </main>
  );
}

export default function SnakeLadderGame() {
  const [room, setRoom] = useState<RoomView | null>(null);
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [moving, setMoving] = useState(false);
  const [dicePreview, setDicePreview] = useState<number | null>(null);
  const [animatedPositions, setAnimatedPositions] = useState<AnimatedPositions>({});
  const [highlightedCell, setHighlightedCell] = useState<number | null>(null);
  const [movingRole, setMovingRole] = useState<PlayerRole | null>(null);
  const [transitioningRole, setTransitioningRole] = useState<PlayerRole | null>(null);
  const [motionMessage, setMotionMessage] = useState("");
  const [challengeBusy, setChallengeBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [booting, setBooting] = useState(true);
  const roomRef = useRef<RoomView | null>(null);
  const animationLockRef = useRef(false);

  const commitRoom = useCallback((nextRoom: RoomView) => {
    roomRef.current = nextRoom;
    setRoom(nextRoom);
  }, []);

  const fetchRoom = useCallback(async (code: string, playerToken = "") => {
    const response = await fetch(`/api/rooms/${code}`, {
      headers: playerToken ? { "x-player-token": playerToken } : undefined,
      cache: "no-store",
    });
    const payload = (await response.json()) as RoomView & { error?: string };
    if (!response.ok) throw new Error(payload.error ?? "Ruang tidak ditemukan.");
    if (payload.gameSlug !== SNAKE_LADDER_SLUG) {
      throw new Error("Kode ruang ini digunakan oleh permainan lain.");
    }
    return payload;
  }, []);

  const animateMovement = useCallback(async (fromRoom: RoomView, nextRoom: RoomView) => {
    const latestEvent = nextRoom.history[0];
    const roll = nextRoom.lastRoll;
    const role = latestEvent?.role;

    if (!roll || !role || !latestEvent.title.includes("melempar")) return;

    const playerName = nameForRole(nextRoom, role);
    const startPosition = positionForRole(fromRoom, role);
    const attemptedPosition = startPosition + roll;
    const finalPosition = positionForRole(nextRoom, role);

    setMoving(true);
    setMovingRole(role);
    setMotionMessage(`${playerName} mendapat angka ${roll}.`);

    if (attemptedPosition > 100) {
      setHighlightedCell(startPosition);
      setMotionMessage(`${playerName} perlu angka yang tepat untuk mencapai petak 100.`);
      await wait(800);
      return;
    }

    for (let position = startPosition + 1; position <= attemptedPosition; position += 1) {
      setAnimatedPositions({ [role]: position });
      setHighlightedCell(position);
      setMotionMessage(`${playerName} melangkah ke petak ${position}…`);
      await wait(175);
    }

    if (finalPosition !== attemptedPosition) {
      const transition = LADDERS[attemptedPosition] ? "ladder" : "snake";
      setTransitioningRole(role);
      setMotionMessage(
        transition === "ladder"
          ? `${playerName} menemukan momen manis!`
          : `${playerName} terkena salah paham kecil!`,
      );

      await wait(520);
      setAnimatedPositions({ [role]: finalPosition });
      setHighlightedCell(finalPosition);
      setMotionMessage(
        transition === "ladder"
          ? `${playerName} naik ke petak ${finalPosition}.`
          : `${playerName} turun ke petak ${finalPosition}.`,
      );
      await wait(720);
    } else {
      setMotionMessage(`${playerName} berhenti di petak ${finalPosition}.`);
      await wait(420);
    }
  }, []);

  const clearAnimation = useCallback(() => {
    setRolling(false);
    setMoving(false);
    setAnimatedPositions({});
    setHighlightedCell(null);
    setMovingRole(null);
    setTransitioningRole(null);
    setMotionMessage("");
  }, []);

  const playIncomingRoll = useCallback(async (nextRoom: RoomView) => {
    const currentRoom = roomRef.current;
    const latestEvent = nextRoom.history[0];

    if (
      !currentRoom ||
      !nextRoom.lastRoll ||
      !latestEvent?.role ||
      !latestEvent.title.includes("melempar")
    ) {
      commitRoom(nextRoom);
      return;
    }

    if (animationLockRef.current) return;
    animationLockRef.current = true;
    setRolling(true);
    const ticker = window.setInterval(() => {
      setDicePreview(Math.floor(Math.random() * 6) + 1);
    }, 85);

    try {
      await wait(650);
      window.clearInterval(ticker);
      setDicePreview(nextRoom.lastRoll);
      setRolling(false);
      await animateMovement(currentRoom, nextRoom);
      commitRoom(nextRoom);
    } finally {
      window.clearInterval(ticker);
      clearAnimation();
      animationLockRef.current = false;
    }
  }, [animateMovement, clearAnimation, commitRoom]);

  useEffect(() => {
    let cancelled = false;
    const initialize = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("room")?.toUpperCase() ?? "";
      if (!code) {
        setBooting(false);
        return;
      }

      setRoomCode(code);
      const saved = readSavedToken(code);
      setToken(saved);
      fetchRoom(code, saved)
        .then((nextRoom) => {
          if (!cancelled) commitRoom(nextRoom);
        })
        .catch((caught: Error) => {
          if (!cancelled) setError(caught.message);
        })
        .finally(() => {
          if (!cancelled) setBooting(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(initialize);
    };
  }, [commitRoom, fetchRoom]);

  useEffect(() => {
    if (!room?.code) return;
    const poll = window.setInterval(async () => {
      if (animationLockRef.current) return;

      try {
        const nextRoom = await fetchRoom(room.code, token);
        const currentRoom = roomRef.current;
        if (!currentRoom || nextRoom.updatedAt === currentRoom.updatedAt) return;

        const isRollUpdate = Boolean(
          nextRoom.lastRoll && nextRoom.history[0]?.title.includes("melempar"),
        );

        if (isRollUpdate) {
          await playIncomingRoll(nextRoom);
        } else {
          commitRoom(nextRoom);
        }
      } catch {
        // A temporary polling failure should not interrupt an active game.
      }
    }, 2200);
    return () => window.clearInterval(poll);
  }, [commitRoom, fetchRoom, playIncomingRoll, room?.code, token]);

  const createRoom = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          hostName: name, 
          gameSlug: SNAKE_LADDER_SLUG,
        }),
      });
      const payload = (await response.json()) as RoomView & { token?: string; error?: string };
      if (!response.ok || !payload.token) throw new Error(payload.error ?? "Ruang belum berhasil dibuat.");
      saveToken(payload.code, payload.token);
      setToken(payload.token);
      commitRoom(payload);
      setRoomCode(payload.code);
      window.history.replaceState({}, "", `?room=${payload.code}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  };

  const openRoom = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const code = roomCode.toUpperCase();
      const saved = readSavedToken(code);
      const nextRoom = await fetchRoom(code, saved);
      setToken(saved);
      commitRoom(nextRoom);
      window.history.replaceState({}, "", `?room=${nextRoom.code}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ruang tidak ditemukan.");
    } finally {
      setBusy(false);
    }
  };

  const joinRoom = async (event: FormEvent) => {
    event.preventDefault();
    if (!room) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/rooms/${room.code}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "join", guestName: name }),
      });
      const payload = (await response.json()) as RoomView & { token?: string; error?: string };
      if (!response.ok || !payload.token) throw new Error(payload.error ?? "Belum bisa bergabung.");
      saveToken(room.code, payload.token);
      setToken(payload.token);
      commitRoom(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  };

  const postAction = async (action: "roll" | "reset" | "complete-challenge") => {
    const currentRoom = roomRef.current;
    if (!currentRoom || !token) throw new Error("Ruang belum siap.");
    setError("");
    const response = await fetch(`/api/rooms/${currentRoom.code}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-player-token": token },
      body: JSON.stringify({ action }),
    });
    const payload = (await response.json()) as RoomView & { error?: string };
    if (!response.ok) throw new Error(payload.error ?? "Aksi belum berhasil.");
    return payload;
  };

  const rollDice = async () => {
    if (animationLockRef.current || roomRef.current?.challenge) return;

    animationLockRef.current = true;
    setRolling(true);
    setError("");
    const startedAt = window.performance.now();
    const ticker = window.setInterval(() => {
      setDicePreview(Math.floor(Math.random() * 6) + 1);
    }, 85);

    try {
      const nextRoom = await postAction("roll");
      const remainingDelay = Math.max(0, 650 - (window.performance.now() - startedAt));
      await wait(remainingDelay);

      window.clearInterval(ticker);
      setDicePreview(nextRoom.lastRoll ?? 1);
      setRolling(false);

      const currentRoom = roomRef.current;
      if (currentRoom) await animateMovement(currentRoom, nextRoom);
      commitRoom(nextRoom);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Dadu belum berhasil dilempar.");
    } finally {
      window.clearInterval(ticker);
      clearAnimation();
      animationLockRef.current = false;
    }
  };

  const resetGame = async () => {
    if (animationLockRef.current) return;
    setBusy(true);
    try {
      const nextRoom = await postAction("reset");
      setDicePreview(null);
      commitRoom(nextRoom);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Permainan belum berhasil diulang.");
    } finally {
      setBusy(false);
    }
  };

  const completeChallenge = async () => {
    if (challengeBusy || animationLockRef.current) return;
    setChallengeBusy(true);
    try {
      const nextRoom = await postAction("complete-challenge");
      commitRoom(nextRoom);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Petak Cerita belum berhasil diselesaikan.");
    } finally {
      setChallengeBusy(false);
    }
  };

  const copyInvite = async () => {
    if (!room) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${room.code}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const leaveRoom = () => {
    roomRef.current = null;
    setRoom(null);
    setToken("");
    setRoomCode("");
    setError("");
    setDicePreview(null);
    clearAnimation();
    window.history.replaceState({}, "", window.location.pathname);
  };

  const currentPlayer = useMemo(() => {
    if (!room) return null;
    return room.turn === "host" ? room.players.host : room.players.guest;
  }, [room]);

  if (booting) {
    return (
      <main className="loading-screen">
        <span className="brand-mark">♥</span>
        <p>Menyambungkan ruang kalian…</p>
      </main>
    );
  }

  if (!room) {
    return (
      <div className="site-shell">
        <Header />
        <Landing
          roomCode={roomCode}
          setRoomCode={setRoomCode}
          name={name}
          setName={setName}
          busy={busy}
          error={error}
          onCreate={createRoom}
          onOpenRoom={openRoom}
        />
        <Footer />
      </div>
    );
  }

  if (!room.you) {
    return (
      <div className="site-shell">
        <Header />
        <JoinRoom
          room={room}
          name={name}
          setName={setName}
          busy={busy}
          error={error}
          onJoin={joinRoom}
          onBack={leaveRoom}
        />
        <Footer />
      </div>
    );
  }

  const myTurn = room.turn === room.you && !room.challenge;
  const waiting = room.status === "waiting";
  const diceValue = dicePreview ?? room.lastRoll ?? 1;
  const hostPosition = animatedPositions.host ?? room.players.host.position;
  const guestPosition = animatedPositions.guest ?? room.players.guest?.position ?? 1;
  const challengeRole = room.challengeFor ?? room.turn;
  const challengePlayerName = nameForRole(room, challengeRole);
  const challengeIsMine = room.you === challengeRole;

  return (
    <div className="game-page">
      <Header game room={room} onCopy={copyInvite} copied={copied} />
      {room.winner ? (
        <FinishCelebration
          key={`${room.code}-${room.winner.role}`}
          winnerName={room.winner.name}
        />
      ) : null}
      <main className="game-shell">
        <section className="board-card">
          <div className="board-heading">
            <div>
              <span className="eyebrow"><span className="status-dot" /> RUANG {room.code}</span>
              <h1>Menuju petak seratus</h1>
            </div>
            <div className="legend" aria-label="Legenda papan">
              <span><i className="legend-dot ladder" /> Momen manis</span>
              <span><i className="legend-dot snake" /> Salah paham</span>
              <span><i className="legend-heart">♥</i> Cerita</span>
            </div>
          </div>
          <Board
            room={room}
            animatedPositions={animatedPositions}
            highlightedCell={highlightedCell}
            movingRole={movingRole}
            transitioningRole={transitioningRole}
          />
          <div className="board-caption">
            <span><b>01</b> MULAI DI SINI</span>
            <span>Petak 100 <b>♥</b></span>
          </div>
        </section>

        <aside className="game-sidebar">
          <section className="turn-card">
            <div className="turn-card-top">
              <span className="turn-label">{waiting ? "MENUNGGU PASANGAN" : room.winner ? "PERMAINAN SELESAI" : "GILIRAN SEKARANG"}</span>
              {!waiting && !room.winner ? <span className="live-pill"><i /> LIVE</span> : null}
            </div>

            <div className="players-stack">
              <PlayerCard
                role="host"
                name={room.players.host.name}
                position={hostPosition}
                active={!waiting && !room.winner && room.turn === "host"}
                isYou={room.you === "host"}
              />
              {room.players.guest ? (
                <PlayerCard
                  role="guest"
                  name={room.players.guest.name}
                  position={guestPosition}
                  active={!room.winner && room.turn === "guest"}
                  isYou={room.you === "guest"}
                />
              ) : (
                <article className="player-card empty-player">
                  <span className="avatar">?</span>
                  <span className="player-copy"><span className="player-name">Menunggu dia…</span><span className="player-position">Bagikan tautan ruang</span></span>
                </article>
              )}
            </div>

            <div className="dice-zone">
              <DiceFace value={diceValue} rolling={rolling} />
              <div className="dice-copy" aria-live="polite">
                <strong>
                  {motionMessage
                    ? motionMessage
                    : waiting
                    ? "Kirim undangan dulu"
                    : room.winner
                      ? `${room.winner.name} sampai duluan!`
                      : room.challenge
                        ? `Petak Cerita untuk ${challengePlayerName}`
                      : myTurn
                        ? "Dadu ada di tanganmu"
                        : `Menunggu ${currentPlayer?.name ?? "pasangan"}`}
                </strong>
                <span>
                  {moving
                    ? "Ikuti perjalanan pion di papan."
                    : waiting
                      ? "Dia akan muncul di sini saat bergabung."
                      : room.winner
                        ? "Kalian berhasil sampai bersama."
                        : room.challenge
                          ? "Selesaikan tantangannya sebelum giliran berpindah."
                          : myTurn
                            ? "Tekan tombol untuk melangkah."
                            : "Halaman akan terbarui otomatis."}
                </span>
              </div>
            </div>

            {waiting ? (
              <button className="invite-button" type="button" onClick={copyInvite}>
                <span>⧉</span> {copied ? "Tautan tersalin!" : "Salin tautan undangan"}
              </button>
            ) : room.winner ? (
              room.you === "host" ? (
                <button className="primary-button roll-button" type="button" onClick={resetGame} disabled={busy}>
                  {busy ? "Menyiapkan permainan…" : "Main sekali lagi"} <span>↻</span>
                </button>
              ) : (
                <p className="waiting-reset">Host bisa memulai permainan baru.</p>
              )
            ) : (
              <button
                className="primary-button roll-button"
                type="button"
                onClick={rollDice}
                disabled={!myTurn || rolling || moving || Boolean(room.challenge)}
              >
                {rolling
                  ? "Dadu berputar…"
                  : moving
                    ? "Pion sedang berjalan…"
                    : room.challenge
                      ? "Selesaikan Petak Cerita"
                      : myTurn
                        ? "Lempar dadu"
                        : "Tunggu giliran"}
                <span aria-hidden="true">⚄</span>
              </button>
            )}
            {error ? <p className="game-error" role="alert">{error}</p> : null}
          </section>

          <section className={`challenge-card ${room.challenge ? "has-card" : ""}`}>
            <div className="challenge-icon">♥</div>
            <div>
              <span className="challenge-label">PETAK CERITA</span>
              <p>{room.challenge ?? "Mendarat di petak ♥ akan membuka pertanyaan atau tantangan kecil untuk kalian."}</p>
            </div>
          </section>

          <section className="history-card">
            <div className="section-title-row">
              <span className="section-title">JEJAK PERMAINAN</span>
              <span className="sync-copy"><i /> tersinkron</span>
            </div>
            <ol className="history-list">
              {room.history.slice(0, 4).map((item, index) => (
                <li key={`${item.at}-${index}`}>
                  <span className={`history-avatar ${item.role ? `avatar-${item.role}` : ""}`}>
                    {item.role === "host" ? initials(room.players.host.name) : item.role === "guest" && room.players.guest ? initials(room.players.guest.name) : "♥"}
                  </span>
                  <span><strong>{item.title}</strong><small>{item.detail}</small></span>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </main>

      {room.challenge ? (
        <div className="challenge-modal-backdrop">
          <section
            className="challenge-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="challenge-title"
          >
            <span className="challenge-modal-heart" aria-hidden="true">♥</span>
            <span className="challenge-modal-label">PETAK CERITA</span>
            <h2 id="challenge-title">Giliran {challengePlayerName}</h2>
            <p>{room.challenge}</p>

            {challengeIsMine ? (
              <button
                className="primary-button challenge-complete-button"
                type="button"
                onClick={completeChallenge}
                disabled={challengeBusy}
                autoFocus
              >
                {challengeBusy ? "Menyimpan…" : "Sudah selesai — lanjutkan"}
                <span aria-hidden="true">→</span>
              </button>
            ) : (
              <div className="challenge-waiting" role="status">
                <i /> Menunggu {challengePlayerName} menyelesaikannya…
              </div>
            )}

            {error ? <p className="game-error" role="alert">{error}</p> : null}
          </section>
        </div>
      ) : null}

      <footer className="game-footer">
        <span>Jarak boleh jauh. Giliran tetap dekat.</span>
        <button type="button" className="text-button" onClick={leaveRoom}>Keluar dari tampilan ruang</button>
      </footer>
    </div>
  );
}

function Header({
  game = false,
  room,
  onCopy,
  copied,
}: {
  game?: boolean;
  room?: RoomView;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Jarak dan Dadu, beranda">
        <span className="brand-mark">♥</span>
        <span>JARAK <i>&</i> DADU<small>MAIN BARENG, MESKI BERJAUHAN</small></span>
      </Link>
      {game && room ? (
        <button className="room-chip" onClick={onCopy} type="button" aria-label="Salin tautan undangan">
          <span><i /> RUANG</span>
          <strong>{room.code}</strong>
          <b>{copied ? "✓" : "⧉"}</b>
        </button>
      ) : (
        <span className="header-note">Dibuat untuk dua hati <i>♥</i></span>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <span>JARAK & DADU © 2026</span>
      <span>Jarak boleh jauh. Giliran tetap dekat. <i>♥</i></span>
    </footer>
  );
}
