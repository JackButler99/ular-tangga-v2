"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { LONGING_MAZE_SLUG } from "@/features/platform/game-registry";

import type {
  LongingMazeAction,
  LongingMazeActionPayload,
} from "./room-actions";
import type { LongingMazeRoomView } from "./room-view";

const TOKEN_KEY = "main-berdua-longing-maze-player";
const CHAT_COMPAT_TOKEN_KEY =
  "main-berdua-most-likely-player";

type RoomPayload = LongingMazeRoomView & {
  token?: string;
  error?: string;
};

function cleanCode(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
}

function readSavedToken(code: string) {
  try {
    return (
      localStorage.getItem(`${TOKEN_KEY}:${code}`) ??
      localStorage.getItem(
        `${CHAT_COMPAT_TOKEN_KEY}:${code}`,
      ) ??
      ""
    );
  } catch {
    return "";
  }
}

function saveToken(code: string, token: string) {
  try {
    localStorage.setItem(`${TOKEN_KEY}:${code}`, token);
    localStorage.setItem(
      `${CHAT_COMPAT_TOKEN_KEY}:${code}`,
      token,
    );
  } catch {
    // Room tetap dapat digunakan pada tab saat ini.
  }
}

export function useLongingMazeRoom() {
  const [room, setRoom] =
    useState<LongingMazeRoomView | null>(null);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [booting, setBooting] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const roomRef = useRef<LongingMazeRoomView | null>(null);

  const commitRoom = useCallback(
    (nextRoom: LongingMazeRoomView) => {
      roomRef.current = nextRoom;
      setRoom(nextRoom);
    },
    [],
  );

  const fetchRoom = useCallback(
    async (code: string, playerToken = "") => {
      const response = await fetch(
        `/api/rooms/${cleanCode(code)}`,
        {
          headers: playerToken
            ? {
                "x-player-token": playerToken,
              }
            : undefined,
          cache: "no-store",
        },
      );
      const payload = (await response.json()) as RoomPayload;

      if (!response.ok) {
        throw new Error(
          payload.error ?? "Room tidak ditemukan.",
        );
      }

      if (payload.gameSlug !== LONGING_MAZE_SLUG) {
        throw new Error(
          "Kode room ini digunakan oleh permainan lain.",
        );
      }

      return payload;
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(
        window.location.search,
      );
      const code = cleanCode(params.get("room") ?? "");

      if (!code) {
        setBooting(false);
        return;
      }

      const savedToken = readSavedToken(code);
      setToken(savedToken);

      fetchRoom(code, savedToken)
        .then((nextRoom) => {
          if (!cancelled) {
            commitRoom(nextRoom);
          }
        })
        .catch((caught: Error) => {
          if (!cancelled) {
            setError(caught.message);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setBooting(false);
          }
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [commitRoom, fetchRoom]);

  useEffect(() => {
  if (!room?.code) {
    return;
  }

  const interval = window.setInterval(async () => {
    try {
      const nextRoom = await fetchRoom(
        room.code,
        token,
      );

      const currentRoom = roomRef.current;

      if (
        currentRoom?.code === room.code &&
        nextRoom.code === room.code &&
        nextRoom.updatedAt > currentRoom.updatedAt
      ) {
        commitRoom(nextRoom);
      }
    } catch {
      // Gangguan polling sementara tidak menutup room.
    }
  }, 1500);

  return () => window.clearInterval(interval);
    }, [
      commitRoom,
      fetchRoom,
      room?.code,
      token,
    ]);

  async function createRoom(name: string) {
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          hostName: name,
          gameSlug: LONGING_MAZE_SLUG,
        }),
      });
      const payload = (await response.json()) as RoomPayload;

      if (
        !response.ok ||
        !payload.token ||
        payload.gameSlug !== LONGING_MAZE_SLUG
      ) {
        throw new Error(
          payload.error ??
            "Server membuat room dengan jenis game yang salah. Restart server lalu coba lagi.",
        );
      }

      saveToken(payload.code, payload.token);
      setToken(payload.token);
      commitRoom(payload);
      window.history.replaceState(
        {},
        "",
        `?room=${payload.code}`,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Terjadi kesalahan.",
      );
    } finally {
      setBusy(false);
      setBooting(false);
    }
  }

  async function openRoom(code: string) {
    setBusy(true);
    setError("");

    try {
      const normalizedCode = cleanCode(code);
      const savedToken = readSavedToken(normalizedCode);
      const nextRoom = await fetchRoom(
        normalizedCode,
        savedToken,
      );

      setToken(savedToken);
      commitRoom(nextRoom);
      window.history.replaceState(
        {},
        "",
        `?room=${nextRoom.code}`,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Room tidak ditemukan.",
      );
    } finally {
      setBusy(false);
      setBooting(false);
    }
  }

  async function joinRoom(name: string) {
    const currentRoom = roomRef.current;

    if (!currentRoom) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await fetch(
        `/api/rooms/${currentRoom.code}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            action: "join",
            guestName: name,
          }),
        },
      );
      const payload = (await response.json()) as RoomPayload;

      if (!response.ok || !payload.token) {
        throw new Error(
          payload.error ?? "Belum bisa bergabung.",
        );
      }

      saveToken(currentRoom.code, payload.token);
      setToken(payload.token);
      commitRoom(payload);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Terjadi kesalahan.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function performAction(
    action: LongingMazeAction,
    actionPayload: LongingMazeActionPayload = {},
  ) {
    const currentRoom = roomRef.current;

    if (!currentRoom || !token) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await fetch(
        `/api/rooms/${currentRoom.code}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-player-token": token,
          },
          body: JSON.stringify({
            action,
            ...actionPayload,
          }),
        },
      );
      const payload = (await response.json()) as RoomPayload;

      if (!response.ok) {
        throw new Error(
          payload.error ?? "Aksi belum berhasil.",
        );
      }

      commitRoom(payload);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Terjadi kesalahan.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyInvite() {
    const currentRoom = roomRef.current;

    if (!currentRoom) {
      return;
    }

    const url =
      `${window.location.origin}${window.location.pathname}` +
      `?room=${currentRoom.code}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Tautan belum berhasil disalin.");
    }
  }

  function leaveRoom() {
    roomRef.current = null;
    setRoom(null);
    setToken("");
    setError("");
    window.history.replaceState(
      {},
      "",
      window.location.pathname,
    );
  }

  return {
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
  };
}
