"use client";

import { useAppLanguage } from "@/features/platform/i18n/language-provider";

type LoveLevelCutsceneProps = {
  hostName: string;
  guestName: string;
  level: number;
  quote: string;
  source: string;
  sourceUrl: string;
  viewerReady: boolean;
  partnerReady: boolean;
  busy: boolean;
  onContinue: () => void;
};

const HEARTS = [
  ["9%", "0s", "1.05"],
  ["20%", "1.1s", ".72"],
  ["34%", ".45s", ".9"],
  ["51%", "1.7s", ".65"],
  ["68%", ".2s", "1"],
  ["82%", "1.35s", ".78"],
  ["93%", ".75s", ".92"],
] as const;

const CSS = `
  @keyframes cipher-heart-rise {
    0% { transform: translateY(30px) scale(.7) rotate(-8deg); opacity: 0; }
    18% { opacity: .8; }
    100% { transform: translateY(-112vh) scale(1.15) rotate(12deg); opacity: 0; }
  }
  @keyframes cipher-bear-breathe {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-3px) scale(1.012); }
  }
  @keyframes cipher-glow {
    0%, 100% { opacity: .48; transform: scale(.94); }
    50% { opacity: .86; transform: scale(1.05); }
  }
  .cipher-heart-particle {
    position: absolute;
    bottom: -36px;
    color: #fda4af;
    animation: cipher-heart-rise 5.8s linear infinite;
    filter: drop-shadow(0 0 9px rgba(251,113,133,.45));
  }
  .cipher-bears { animation: cipher-bear-breathe 3.4s ease-in-out infinite; transform-origin: center bottom; }
  .cipher-heart-glow { animation: cipher-glow 2.1s ease-in-out infinite; transform-origin: center; }
  @media (prefers-reduced-motion: reduce) {
    .cipher-heart-particle, .cipher-bears, .cipher-heart-glow { animation: none !important; }
  }
`;

function CelebratingBears() {
  const { pick } = useAppLanguage();

  return (
    <svg
      viewBox="0 0 520 300"
      className="cipher-bears h-full w-full overflow-visible"
      aria-label={pick(
        "Dua beruang merayakan kemenangan bersama",
        "Two bears celebrating together",
      )}
      role="img"
    >
      <defs>
        <linearGradient id="bear-pink" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fecdd3" />
          <stop offset="1" stopColor="#fb7185" />
        </linearGradient>
        <linearGradient id="bear-violet" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ddd6fe" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
        <filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="13" stdDeviation="12" floodColor="#09090b" floodOpacity=".42" />
        </filter>
      </defs>

      <ellipse cx="260" cy="272" rx="155" ry="18" fill="#020617" opacity=".42" />

      <g filter="url(#soft-shadow)">
        <g transform="translate(78 30) rotate(-3 120 140)">
          <circle cx="67" cy="58" r="31" fill="#fb7185" />
          <circle cx="176" cy="58" r="31" fill="#fb7185" />
          <circle cx="67" cy="58" r="17" fill="#ffe4e6" opacity=".75" />
          <circle cx="176" cy="58" r="17" fill="#ffe4e6" opacity=".75" />
          <ellipse cx="121" cy="126" rx="91" ry="91" fill="url(#bear-pink)" />
          <ellipse cx="121" cy="212" rx="72" ry="59" fill="url(#bear-pink)" />
          <ellipse cx="121" cy="144" rx="45" ry="34" fill="#fff1f2" opacity=".88" />
          <circle cx="91" cy="116" r="7" fill="#3f1d2b" />
          <circle cx="151" cy="116" r="7" fill="#3f1d2b" />
          <ellipse cx="121" cy="139" rx="11" ry="8" fill="#3f1d2b" />
          <path d="M121 146 C113 158 102 157 97 150 M121 146 C129 158 140 157 145 150" fill="none" stroke="#3f1d2b" strokeWidth="4" strokeLinecap="round" />
        </g>

        <g transform="translate(241 31) rotate(3 120 140)">
          <circle cx="67" cy="58" r="31" fill="#a78bfa" />
          <circle cx="176" cy="58" r="31" fill="#a78bfa" />
          <circle cx="67" cy="58" r="17" fill="#ede9fe" opacity=".75" />
          <circle cx="176" cy="58" r="17" fill="#ede9fe" opacity=".75" />
          <ellipse cx="121" cy="126" rx="91" ry="91" fill="url(#bear-violet)" />
          <ellipse cx="121" cy="212" rx="72" ry="59" fill="url(#bear-violet)" />
          <ellipse cx="121" cy="144" rx="45" ry="34" fill="#f5f3ff" opacity=".9" />
          <circle cx="91" cy="116" r="7" fill="#292044" />
          <circle cx="151" cy="116" r="7" fill="#292044" />
          <ellipse cx="121" cy="139" rx="11" ry="8" fill="#292044" />
          <path d="M121 146 C113 158 102 157 97 150 M121 146 C129 158 140 157 145 150" fill="none" stroke="#292044" strokeWidth="4" strokeLinecap="round" />
        </g>
      </g>

      <g className="cipher-heart-glow">
        <path
          d="M260 82 C238 51 190 63 194 101 C198 139 260 174 260 174 C260 174 322 139 326 101 C330 63 282 51 260 82 Z"
          fill="#fb7185"
          stroke="#ffe4e6"
          strokeWidth="5"
        />
        <text x="260" y="122" textAnchor="middle" fill="white" fontSize="25" fontWeight="900">
          ✓
        </text>
      </g>
    </svg>
  );
}

export function LoveLevelCutscene({
  hostName,
  guestName,
  level,
  quote,
  source,
  sourceUrl,
  viewerReady,
  partnerReady,
  busy,
  onContinue,
}: LoveLevelCutsceneProps) {
  const { pick } = useAppLanguage();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={pick(
        `Perayaan level ${level} untuk ${hostName} dan ${guestName}`,
        `Level ${level} celebration for ${hostName} and ${guestName}`,
      )}
      className="fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,rgba(244,114,182,.25),transparent_34%),linear-gradient(145deg,rgba(8,8,22,.985),rgba(25,8,34,.99))] p-3 text-white backdrop-blur-xl"
    >
      <style>{CSS}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {HEARTS.map(([left, delay, scale], index) => (
          <span
            key={`${left}-${index}`}
            className="cipher-heart-particle text-2xl"
            style={{ left, animationDelay: delay, scale }}
          >
            ♥
          </span>
        ))}
      </div>

      <section className="relative max-h-[calc(100dvh-24px)] w-[min(94vw,720px)] overflow-auto rounded-[2rem] border border-white/15 bg-[linear-gradient(160deg,rgba(34,20,52,.97),rgba(10,12,29,.98))] px-5 py-7 text-center shadow-[0_36px_120px_rgba(0,0,0,.65)] sm:px-9 sm:py-9">
        <p className="text-[11px] font-black tracking-[.24em] text-rose-300">
          {pick(`LEVEL ${level} TERPECAHKAN`, `LEVEL ${level} DECODED`)}
        </p>

        <div className="mx-auto mt-1 aspect-[520/300] w-full max-w-[520px]">
          <CelebratingBears />
        </div>

        <h2 className="-mt-2 text-3xl font-black sm:text-4xl">
          {pick(
            "Kalian menemukan maknanya bersama.",
            "You found its meaning together.",
          )}
        </h2>
        <p className="mt-3 text-sm text-zinc-400">
          {hostName} <span className="text-rose-300">♥</span> {guestName}
        </p>

        <blockquote className="mx-auto mt-6 max-w-xl rounded-3xl border border-rose-300/15 bg-rose-300/[.06] px-5 py-5">
          <p className="font-serif text-lg leading-8 text-rose-50 sm:text-xl">
            “{quote}”
          </p>
          <footer className="mt-3 text-xs leading-5 text-zinc-500">
            {source}
          </footer>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex text-xs font-bold text-rose-300 underline decoration-rose-300/30 underline-offset-4 hover:text-rose-200"
          >
            {pick("Lihat sumber kutipan ↗", "View quotation source ↗")}
          </a>
        </blockquote>

        <button
          type="button"
          disabled={busy || viewerReady}
          onClick={onContinue}
          className="mt-7 min-h-13 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-violet-500 px-6 font-black shadow-lg shadow-rose-950/40 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-55 disabled:hover:translate-y-0"
        >
          {viewerReady
            ? pick(
                "Menunggu pasangan selesai melihat…",
                "Waiting for your partner…",
              )
            : partnerReady
              ? pick(
                  "Pasangan siap — buka level berikutnya",
                  "Your partner is ready — open the next level",
                )
              : pick(
                  "Lanjut setelah selesai membaca",
                  "Continue when you have finished reading",
                )}
        </button>
      </section>
    </div>
  );
}
