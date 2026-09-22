"use client";

import { type CSSProperties, useState } from "react";

type MazeFailureSceneProps = {
  reason: string;
};

const CSS = `
  .maze-fail-scene {
    animation: maze-fail-scene-in 320ms ease-out both;
  }

  .maze-fail-route {
    fill: none;
    stroke-linecap: round;
    stroke-width: 5;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation:
      maze-fail-route-draw 1.25s 180ms ease-out forwards,
      maze-fail-route-dim 850ms 1.85s ease-in forwards;
  }

  .maze-fail-wall {
    fill: none;
    stroke: rgba(148,163,184,.16);
    stroke-width: 3;
    stroke-linecap: round;
    animation: maze-fail-wall-dim 1s 1.65s ease-in forwards;
  }

  .maze-fail-fog {
    position: absolute;
    z-index: 12;
    left: -35%;
    width: 170%;
    height: 28%;
    border-radius: 999px;
    opacity: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(100,116,139,.28),
      rgba(226,232,240,.17),
      rgba(100,116,139,.28),
      transparent
    );
    filter: blur(18px);
    animation: maze-fail-fog-pass 4.8s 1.25s ease-in-out infinite;
  }

  .maze-fail-fog.one { top: 34%; }
  .maze-fail-fog.two {
    top: 55%;
    animation-delay: 1.75s;
    animation-direction: reverse;
  }

  .maze-fail-bear {
    position: absolute;
    z-index: 10;
    top: 46%;
    width: clamp(78px,16vw,112px);
    opacity: 0;
    filter: drop-shadow(0 15px 16px rgba(0,0,0,.3));
  }

  .maze-fail-bear.left {
    left: 11%;
    animation:
      maze-fail-bear-left 1.65s 430ms cubic-bezier(.2,.8,.25,1) forwards,
      maze-fail-bear-breathe 1.9s 2.2s ease-in-out infinite;
  }

  .maze-fail-bear.right {
    right: 11%;
    animation:
      maze-fail-bear-right 1.65s 430ms cubic-bezier(.2,.8,.25,1) forwards,
      maze-fail-bear-breathe 1.9s 2.35s ease-in-out infinite reverse;
  }

  .maze-fail-bear svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .maze-fail-ember {
    position: absolute;
    z-index: 18;
    top: 48%;
    left: 50%;
    display: grid;
    width: clamp(62px,13vw,86px);
    aspect-ratio: 1;
    place-items: center;
    border: 1px solid rgba(251,191,36,.28);
    border-radius: 999px;
    color: #fda4af;
    font-size: clamp(30px,7vw,48px);
    opacity: 0;
    background: radial-gradient(
      circle,
      rgba(251,191,36,.22),
      rgba(244,63,94,.1) 46%,
      transparent 72%
    );
    box-shadow:
      0 0 28px rgba(251,113,133,.25),
      inset 0 0 20px rgba(251,191,36,.08);
    transform: translate(-50%,-50%) scale(.2);
    animation:
      maze-fail-ember-arrive 650ms 1.3s cubic-bezier(.2,.9,.3,1.25) forwards,
      maze-fail-ember-dim 900ms 2.25s ease-in-out forwards,
      maze-fail-ember-breathe 1.7s 3.2s ease-in-out infinite;
  }

  .maze-fail-spark {
    position: absolute;
    z-index: 17;
    top: 48%;
    left: 50%;
    width: 5px;
    height: 5px;
    border-radius: 999px;
    opacity: 0;
    background: #fbbf24;
    box-shadow: 0 0 9px #fb7185;
    animation: maze-fail-spark-away 1.6s var(--delay) ease-out forwards;
  }

  .maze-fail-copy {
    opacity: 0;
    transform: translateY(12px);
    animation: maze-fail-copy-in 650ms 3.15s ease-out forwards;
  }

  @keyframes maze-fail-scene-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes maze-fail-route-draw {
    to { stroke-dashoffset: 0; }
  }

  @keyframes maze-fail-route-dim {
    to { opacity: .18; filter: blur(1.5px); }
  }

  @keyframes maze-fail-wall-dim {
    to { opacity: .25; }
  }

  @keyframes maze-fail-fog-pass {
    0% { opacity: 0; transform: translateX(-14%); }
    28% { opacity: .7; }
    72% { opacity: .55; }
    100% { opacity: 0; transform: translateX(14%); }
  }

  @keyframes maze-fail-bear-left {
    0% { opacity: 0; transform: translate(-42px,28px) scale(.84); }
    70% { opacity: 1; transform: translate(10px,0) scale(1); }
    100% { opacity: .88; transform: translate(0,0) scale(1); }
  }

  @keyframes maze-fail-bear-right {
    0% { opacity: 0; transform: translate(42px,28px) scale(.84); }
    70% { opacity: 1; transform: translate(-10px,0) scale(1); }
    100% { opacity: .88; transform: translate(0,0) scale(1); }
  }

  @keyframes maze-fail-bear-breathe {
    0%,100% { margin-top: 0; }
    50% { margin-top: -3px; }
  }

  @keyframes maze-fail-ember-arrive {
    0% { opacity: 0; transform: translate(-50%,-50%) scale(.2); }
    70% { opacity: 1; transform: translate(-50%,-50%) scale(1.12); }
    100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
  }

  @keyframes maze-fail-ember-dim {
    from { opacity: 1; filter: brightness(1); }
    to { opacity: .55; filter: brightness(.72); }
  }

  @keyframes maze-fail-ember-breathe {
    0%,100% { transform: translate(-50%,-50%) scale(.82); }
    50% { transform: translate(-50%,-50%) scale(.88); }
  }

  @keyframes maze-fail-spark-away {
    0% { opacity: 0; transform: translate(-50%,-50%) scale(.4); }
    22% { opacity: .9; }
    100% {
      opacity: 0;
      transform: translate(var(--x),var(--y)) scale(0);
    }
  }

  @keyframes maze-fail-copy-in {
    to { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .maze-fail-scene *,
    .maze-fail-scene *::before,
    .maze-fail-scene *::after {
      animation-delay: 0ms !important;
      animation-duration: 1ms !important;
      animation-iteration-count: 1 !important;
    }
  }
`;

const SPARKS = [
  ["-66px", "-70px", "1.65s"],
  ["55px", "-84px", "1.78s"],
  ["-82px", "18px", "1.9s"],
  ["72px", "22px", "2.02s"],
] as const;

function WaitingBear({ side }: { side: "left" | "right" }) {
  const left = side === "left";
  const fur = left ? "#a86f43" : "#d7a875";
  const dark = left ? "#80502f" : "#ad784d";
  const belly = left ? "#ca9366" : "#ebc49a";
  const innerEar = left ? "#e8a88d" : "#f3b9ad";

  return (
    <svg viewBox="0 0 160 190" aria-hidden="true">
      <ellipse cx="80" cy="178" rx="47" ry="9" fill="rgba(0,0,0,.18)" />
      <circle cx="42" cy="45" r="24" fill={dark} />
      <circle cx="118" cy="45" r="24" fill={dark} />
      <circle cx="42" cy="45" r="13" fill={innerEar} />
      <circle cx="118" cy="45" r="13" fill={innerEar} />
      <ellipse cx="80" cy="132" rx="48" ry="51" fill={fur} />
      <ellipse cx="80" cy="141" rx="29" ry="32" fill={belly} />
      <ellipse cx="54" cy="169" rx="20" ry="13" fill={dark} />
      <ellipse cx="106" cy="169" rx="20" ry="13" fill={dark} />
      <circle cx="80" cy="79" r="56" fill={fur} />
      <ellipse cx="80" cy="94" rx="33" ry="25" fill={belly} />
      <path
        d="M52 69 Q61 66 70 64"
        fill="none"
        stroke="#633c2e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M90 64 Q99 66 108 69"
        fill="none"
        stroke="#633c2e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="61" cy="78" rx="5" ry="7" fill="#241811" />
      <ellipse cx="99" cy="78" rx="5" ry="7" fill="#241811" />
      <circle cx="60" cy="76" r="1.5" fill="white" opacity=".75" />
      <circle cx="98" cy="76" r="1.5" fill="white" opacity=".75" />
      <ellipse cx="80" cy="89" rx="9" ry="7" fill="#382019" />
      <path
        d="M70 107 Q80 99 90 107"
        fill="none"
        stroke="#633c2e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="44" cy="97" rx="9" ry="5" fill="#f58e9f" opacity=".4" />
      <ellipse cx="116" cy="97" rx="9" ry="5" fill="#f58e9f" opacity=".4" />
      <ellipse
        cx="35"
        cy="132"
        rx="14"
        ry="29"
        fill={fur}
        transform="rotate(15 35 132)"
      />
      <ellipse
        cx="125"
        cy="132"
        rx="14"
        ry="29"
        fill={fur}
        transform="rotate(-15 125 132)"
      />
      {left ? (
        <path
          d="M45 115 C65 129 98 129 117 114"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="10"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path
            d="M45 115 C65 129 98 129 117 114"
            fill="none"
            stroke="#f472b6"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M111 24 C124 9 139 14 136 30 C151 27 153 44 138 50 C126 54 115 44 111 24 Z"
            fill="#fb7185"
          />
        </>
      )}
    </svg>
  );
}

export function MazeFailureScene({ reason }: MazeFailureSceneProps) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Perjalanan Labirin Rindu terhenti"
      className="maze-fail-scene fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_43%,rgba(71,85,105,0.24),transparent_34%),linear-gradient(145deg,rgba(5,8,20,0.98),rgba(18,13,31,0.99))] p-3 text-white backdrop-blur-xl"
    >
      <style>{CSS}</style>

      <section className="relative isolate max-h-[calc(100dvh-24px)] w-[min(95vw,720px)] overflow-auto rounded-[2rem] border border-slate-300/15 bg-[radial-gradient(circle_at_50%_42%,rgba(251,191,36,0.08),transparent_32%),linear-gradient(160deg,rgba(22,25,43,0.98),rgba(8,12,25,0.99))] px-4 py-6 text-center shadow-[0_34px_120px_rgba(0,0,0,0.65)] sm:px-7">
        <p className="relative z-20 text-[10px] font-black tracking-[0.24em] text-slate-400">
          CAHAYA BELUM SAMPAI
        </p>

        <div
          className="relative mx-auto -mb-2 mt-1 aspect-[640/350] w-full max-w-[640px] overflow-hidden"
          aria-hidden="true"
        >
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 640 350">
            <defs>
              <linearGradient id="maze-fail-left-route" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#22d3ee" />
                <stop offset="1" stopColor="#94a3b8" />
              </linearGradient>
              <linearGradient id="maze-fail-right-route" x1="1" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="#fb7185" />
                <stop offset="1" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
            <path
              className="maze-fail-wall"
              d="M70 65H208V128H145V224H242 M570 70H432V138H495V230H402 M272 54V116H346V77"
            />
            <path
              className="maze-fail-route"
              pathLength={1}
              stroke="url(#maze-fail-left-route)"
              d="M35 292 C112 290 103 198 184 211 C246 221 244 161 302 174"
            />
            <path
              className="maze-fail-route"
              pathLength={1}
              stroke="url(#maze-fail-right-route)"
              d="M605 292 C528 290 537 198 456 211 C394 221 396 161 338 174"
            />
          </svg>

          <div className="maze-fail-bear left">
            <WaitingBear side="left" />
          </div>
          <div className="maze-fail-bear right">
            <WaitingBear side="right" />
          </div>

          <div className="maze-fail-ember">♥</div>
          {SPARKS.map(([x, y, delay]) => (
            <span
              key={`${x}-${y}`}
              className="maze-fail-spark"
              style={{
                "--x": x,
                "--y": y,
                "--delay": delay,
              } as CSSProperties}
            />
          ))}

          <div className="maze-fail-fog one" />
          <div className="maze-fail-fog two" />
        </div>

        <div className="maze-fail-copy relative z-20">
          <h2 className="mx-auto max-w-xl text-[clamp(27px,6vw,40px)] font-black leading-[1.08]">
            Jalan kalian belum bertemu.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-300">
            Kabut menutup rute kali ini. Namun setiap arah, perlindungan, dan keputusan yang kalian bagi sudah menjadi petunjuk untuk perjalanan berikutnya.
          </p>
          <p className="mx-auto mt-4 max-w-lg rounded-2xl border border-amber-200/15 bg-amber-300/[0.06] px-4 py-3 text-xs leading-5 text-amber-100/75">
            {reason}
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-6 w-full rounded-2xl border border-white/15 bg-white/[0.07] px-5 py-3.5 font-black transition hover:-translate-y-0.5 hover:bg-white/[0.11] active:scale-[0.98]"
          >
            Lihat jejak perjalanan
          </button>
        </div>
      </section>
    </div>
  );
}
