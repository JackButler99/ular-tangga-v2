"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { ConnectionGameSlug } from "@/features/platform/game-registry";
import {
  DEFAULT_QUESTION_COUNT,
  type QuestionCount,
} from "@/features/platform/question-count";

import type {
  ConnectionActionPayload,
  ConnectionRoomAction,
} from "./room-actions";
import type { ConnectionRoomView } from "./room-view";

const TOKEN_KEY = "main-berdua-connection-player";

// RoomChat versi sekarang sudah membaca namespace ini.
const CHAT_COMPAT_TOKEN_KEY =
  "main-berdua-most-likely-player";

type RoomPayload = ConnectionRoomView & {
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

export function useConnectionRoom(
  gameSlug: ConnectionGameSlug,
) {
  const [room, setRoom] =
    useState<ConnectionRoomView | null>(null);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [booting, setBooting] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const roomRef = useRef<ConnectionRoomView | null>(null);

  const commitRoom = useCallback(
    (nextRoom: ConnectionRoomView) => {
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

      if (payload.gameSlug !== gameSlug) {
        throw new Error(
          "Kode room ini digunakan oleh permainan lain.",
        );
      }

      return payload;
    },
    [gameSlug],
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
        const nextRoom = await fetchRoom(room.code, token);

        if (
          nextRoom.updatedAt !==
          roomRef.current?.updatedAt
        ) {
          commitRoom(nextRoom);
        }
      } catch {
        // Gangguan polling sementara tidak menutup room.
      }
    }, 1800);

    return () => window.clearInterval(interval);
  }, [commitRoom, fetchRoom, room?.code, token]);

  async function createRoom(
    name: string,
    questionCount: QuestionCount = DEFAULT_QUESTION_COUNT,
  ) {
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
          gameSlug,
          questionCount,
        }),
      });

      const payload = (await response.json()) as RoomPayload;

      if (!response.ok || !payload.token) {
        throw new Error(
          payload.error ?? "Room belum berhasil dibuat.",
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
    action: ConnectionRoomAction,
    actionPayload: ConnectionActionPayload = {},
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
      `${window.location.origin}` +
      `${window.location.pathname}` +
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
