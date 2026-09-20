"use client";

import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { MAX_CHAT_MESSAGE_LENGTH } from "@/features/platform/chat/message";
import type { PlayerRole } from "@/features/platform/room/types";

const TOKEN_KEYS = [
  "jarak-dadu-player",
  "main-berdua-quiz-player",
  "main-berdua-most-likely-player",
] as const;

const CHAT_POLL_INTERVAL = 1800;

type ChatSession = {
  code: string;
  token: string;
};

type ChatMessage = {
  id: number;
  senderRole: PlayerRole;
  senderName: string;
  body: string;
  createdAt: string;
};

type MessagesPayload = {
  viewerRole?: PlayerRole;
  messages?: ChatMessage[];
  message?: ChatMessage;
  error?: string;
};

function cleanRoomCode(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
}

function detectSession(): ChatSession | null {
  const code = cleanRoomCode(
    new URLSearchParams(window.location.search).get(
      "room",
    ) ?? "",
  );

  if (
    !code ||
    !window.location.pathname.startsWith("/games/")
  ) {
    return null;
  }

  for (const key of TOKEN_KEYS) {
    const token =
      window.localStorage.getItem(`${key}:${code}`) ?? "";

    if (token) {
      return {
        code,
        token,
      };
    }
  }

  return null;
}

function formatMessageTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function initialFrom(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function RoomChat() {
  const [session, setSession] =
    useState<ChatSession | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [viewerRole, setViewerRole] =
    useState<PlayerRole | null>(null);

  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState("");

  const openRef = useRef(false);
  const sessionKeyRef = useRef("");
  const initializedRef = useRef(false);
  const lastSeenIdRef = useRef(0);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function refreshSession() {
      let nextSession: ChatSession | null = null;

      try {
        nextSession = detectSession();
      } catch {
        nextSession = null;
      }

      const nextSessionKey = nextSession
        ? `${nextSession.code}:${nextSession.token}`
        : "";

      if (nextSessionKey === sessionKeyRef.current) {
        return;
      }

      sessionKeyRef.current = nextSessionKey;
      initializedRef.current = false;
      lastSeenIdRef.current = 0;
      openRef.current = false;

      setMessages([]);
      setViewerRole(null);
      setDraft("");
      setUnread(0);
      setError("");
      setOpen(false);
      setSession(nextSession);
    }

    const firstCheck = window.setTimeout(
      refreshSession,
      0,
    );

    const interval = window.setInterval(
      refreshSession,
      800,
    );

    return () => {
      window.clearTimeout(firstCheck);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    openRef.current = open;

    if (!open) {
      return;
    }

    const latest = messages[messages.length - 1];

    if (latest) {
      lastSeenIdRef.current = latest.id;
    }
  }, [messages, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnEscape(
      event: globalThis.KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      closeOnEscape,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        closeOnEscape,
      );
    };
  }, [open]);

  const loadMessages = useCallback(async () => {
    if (!session) {
      return;
    }

    const response = await fetch(
      `/api/rooms/${session.code}/messages`,
      {
        headers: {
          "x-player-token": session.token,
        },
        cache: "no-store",
      },
    );

    const payload =
      (await response.json()) as MessagesPayload;

    if (!response.ok) {
      throw new Error(
        payload.error ?? "Chat belum dapat dimuat.",
      );
    }

    const nextMessages = payload.messages ?? [];
    const nextViewerRole = payload.viewerRole ?? null;
    const latest =
      nextMessages[nextMessages.length - 1];

    setMessages(nextMessages);
    setViewerRole(nextViewerRole);
    setError("");

    if (!initializedRef.current) {
      initializedRef.current = true;
      lastSeenIdRef.current = latest?.id ?? 0;
      setUnread(0);
      return;
    }

    if (openRef.current) {
      lastSeenIdRef.current = latest?.id ?? 0;
      setUnread(0);
      return;
    }

    setUnread(
      nextMessages.filter(
        (message) =>
          message.id > lastSeenIdRef.current &&
          message.senderRole !== nextViewerRole,
      ).length,
    );
  }, [session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;
    let timeout: number | undefined;

    async function poll() {
      try {
        if (!initializedRef.current) {
          setLoading(true);
        }

        await loadMessages();
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Chat belum dapat dimuat.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);

          timeout = window.setTimeout(
            poll,
            CHAT_POLL_INTERVAL,
          );
        }
      }
    }

    void poll();

    return () => {
      cancelled = true;

      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }
    };
  }, [loadMessages, session]);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();

    const body = draft.trim();

    if (!session || !body || sending) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await fetch(
        `/api/rooms/${session.code}/messages`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-player-token": session.token,
          },
          body: JSON.stringify({
            body,
          }),
        },
      );

      const payload =
        (await response.json()) as MessagesPayload;

      if (!response.ok || !payload.message) {
        throw new Error(
          payload.error ??
            "Pesan belum berhasil dikirim.",
        );
      }

      setDraft("");
      setViewerRole(
        payload.viewerRole ?? viewerRole,
      );

      setMessages((current) => {
        if (
          current.some(
            (message) =>
              message.id === payload.message?.id,
          )
        ) {
          return current;
        }

        return [
          ...current,
          payload.message as ChatMessage,
        ];
      });

      lastSeenIdRef.current = payload.message.id;
      setUnread(0);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Pesan belum berhasil dikirim.",
      );
    } finally {
      setSending(false);
    }
  }

  function handleComposerKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  function openChat() {
    const latest = messages[messages.length - 1];

    if (latest) {
      lastSeenIdRef.current = latest.id;
    }

    openRef.current = true;
    setUnread(0);
    setOpen(true);
  }

  function closeChat() {
    openRef.current = false;
    setOpen(false);
  }

  if (!session) {
    return null;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={openChat}
        className="fixed bottom-5 right-5 z-[100] flex h-14 items-center gap-3 rounded-full border border-white/15 bg-[#17101d]/95 px-4 text-white shadow-2xl shadow-black/50 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-pink-400/40 hover:bg-[#211426] focus:outline-none focus:ring-2 focus:ring-pink-400/70 sm:bottom-6 sm:right-6"
        aria-label={
          unread > 0
            ? `Buka chat, ${unread} pesan baru`
            : "Buka chat"
        }
      >
        <span className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-lg shadow-lg shadow-pink-950/40">
          <span aria-hidden="true">💬</span>

          {unread > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-[#17101d] bg-red-500 px-1 text-[10px] font-black">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>

        <span className="hidden pr-1 text-sm font-bold sm:block">
          Chat
        </span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label="Tutup chat"
        onClick={closeChat}
        className="fixed inset-0 z-[99] bg-black/55 backdrop-blur-[2px] sm:hidden"
      />

      <aside
        role="dialog"
        aria-label={`Chat room ${session.code}`}
        className="fixed inset-x-3 bottom-3 z-[100] flex h-[min(78svh,620px)] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#110d16]/95 text-white shadow-2xl shadow-black/60 backdrop-blur-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[min(72svh,620px)] sm:w-[390px]"
      >
        <header className="flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-4">
          <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-xl shadow-lg shadow-pink-950/40">
            <span aria-hidden="true">💬</span>

            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#17101d] bg-emerald-400" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-black">
              Chat berdua
            </h2>

            <p className="mt-0.5 truncate text-xs text-zinc-500">
              Room {session.code} · aktif selama bermain
            </p>
          </div>

          <button
            type="button"
            onClick={closeChat}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-xl text-zinc-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-pink-400/60"
            aria-label="Tutup chat"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {loading && messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-pink-400" />

              <p className="mt-3 text-sm text-zinc-500">
                Membuka percakapan…
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-5 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-3xl border border-pink-400/15 bg-pink-400/[0.07] text-3xl">
                💌
              </div>

              <h3 className="mt-5 font-black">
                Mulai percakapan
              </h3>

              <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">
                Kirim pesan singkat tanpa meninggalkan
                ruang permainan.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const mine =
                  message.senderRole === viewerRole;

                return (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2.5 ${
                      mine
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {!mine && (
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-black">
                        {initialFrom(
                          message.senderName,
                        )}
                      </span>
                    )}

                    <div
                      className={`flex max-w-[78%] flex-col ${
                        mine
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      <span className="mb-1 px-1 text-[10px] font-semibold text-zinc-600">
                        {mine
                          ? "Kamu"
                          : message.senderName}
                      </span>

                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-sm leading-5 shadow-sm ${
                          mine
                            ? "rounded-br-md bg-gradient-to-br from-pink-500 to-rose-600 text-white"
                            : "rounded-bl-md border border-white/10 bg-white/[0.07] text-zinc-200"
                        }`}
                      >
                        <p className="break-words">
                          {message.body}
                        </p>
                      </div>

                      <time className="mt-1 px-1 text-[10px] text-zinc-700">
                        {formatMessageTime(
                          message.createdAt,
                        )}
                      </time>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-black/15 p-3">
          {error && (
            <p
              role="alert"
              className="mb-2 rounded-xl border border-red-400/15 bg-red-400/10 px-3 py-2 text-xs text-red-200"
            >
              {error}
            </p>
          )}

          <form
            onSubmit={sendMessage}
            className="flex items-end gap-2"
          >
            <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-2 transition focus-within:border-pink-400/40 focus-within:ring-4 focus-within:ring-pink-500/10">
              <textarea
                value={draft}
                onChange={(event) =>
                  setDraft(event.target.value)
                }
                onKeyDown={handleComposerKeyDown}
                maxLength={MAX_CHAT_MESSAGE_LENGTH}
                rows={1}
                placeholder="Tulis pesan…"
                className="max-h-24 min-h-6 w-full resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-zinc-600"
                aria-label="Pesan chat"
              />

              <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-700">
                <span>Enter untuk kirim</span>

                <span>
                  {draft.length}/
                  {MAX_CHAT_MESSAGE_LENGTH}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!draft.trim() || sending}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-lg font-black shadow-lg shadow-pink-950/40 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              aria-label="Kirim pesan"
            >
              {sending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <span aria-hidden="true">↑</span>
              )}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}