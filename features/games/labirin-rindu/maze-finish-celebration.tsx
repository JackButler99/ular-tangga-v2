"use client";

import { useState } from "react";

type MazeFinishCelebrationProps = {
  hostName: string;
  guestName: string;
};

const PARTICLES = [
  ["7%", "4.1s"],
  ["15%", "5s"],
  ["24%", "4.5s"],
  ["34%", "5.6s"],
  ["44%", "4.2s"],
  ["54%", "5.2s"],
  ["64%", "4.7s"],
  ["74%", "5.8s"],
  ["84%", "4.35s"],
  ["93%", "5.35s"],
] as const;

const CSS = `
  .maze-cutscene {
    animation: maze-scene-in 450ms ease-out both;
  }

  .maze-cut-walls {
    fill: none;
    stroke: rgba(167,139,250,.17);
    stroke-width: 3;
    stroke-linecap: round;
    animation:
      maze-walls-away 1.5s 3.85s ease-in forwards;
  }

  .maze-cut-route {
    fill: none;
    stroke-width: 7;
    stroke-linecap: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    filter: url(#maze-cut-glow);
    animation:
      maze-route-draw 3.1s 450ms ease-in-out forwards;
  }

  .maze-cut-storm {
    position: absolute;
    inset: 14% 23%;
    border: 2px solid rgba(196,181,253,.18);
    border-radius: 999px;
    animation:
      maze-storm-spin 4s linear infinite,
      maze-storm-away 1.5s 3.9s ease-in forwards;
  }

  .maze-cut-storm::before,
  .maze-cut-storm::after {
    content: "";
    position: absolute;
    border-radius: inherit;
    border: 1px dashed rgba(244,114,182,.25);
  }

  .maze-cut-storm::before {
    inset: 10%;
  }

  .maze-cut-storm::after {
    inset: 25%;
    border-color: rgba(34,211,238,.22);
  }

  .maze-cut-guardian {
    position: absolute;
    z-index: 12;
    top: 47%;
    left: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    opacity: 0;
    will-change: transform, opacity;
  }

  .maze-cut-guardian.left {
    animation:
      maze-guardian-left 3.35s 550ms
        cubic-bezier(.2,.72,.25,1) forwards,
      maze-guardian-glow 1.4s 4s
        ease-in-out infinite alternate,
      maze-guardian-fade 280ms 4.78s
        ease-in forwards;
  }

  .maze-cut-guardian.right {
    animation:
      maze-guardian-right 3.35s 550ms
        cubic-bezier(.2,.72,.25,1) forwards,
      maze-guardian-glow 1.4s 4.15s
        ease-in-out infinite alternate,
      maze-guardian-fade 280ms 4.78s
        ease-in forwards;
  }

  .maze-cut-fragment {
    position: absolute;
    z-index: 14;
    top: 43%;
    left: 50%;
    color: #fecdd3;
    font-size: clamp(24px,5vw,38px);
    opacity: 0;
    filter:
      drop-shadow(
        0 0 14px rgba(251,113,133,.9)
      );
  }

  .maze-cut-fragment.left {
    animation:
      maze-fragment-left 1.25s 3.35s
        ease-in-out forwards;
  }

  .maze-cut-fragment.right {
    animation:
      maze-fragment-right 1.25s 3.35s
        ease-in-out forwards;
  }

  .maze-cut-heart {
    position: absolute;
    z-index: 18;
    top: 41%;
    left: 50%;
    font-size: clamp(48px,11vw,78px);
    line-height: 1;
    opacity: 0;
    filter:
      drop-shadow(
        0 0 26px rgba(251,113,133,.95)
      );
    animation:
      maze-heart-unite 1s 4.38s
        cubic-bezier(.2,.9,.3,1.35) forwards,
      maze-heart-away 280ms 4.92s
        ease-in forwards;
  }

  .maze-cut-light {
    position: absolute;
    z-index: 8;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    border-radius: 999px;
    opacity: 0;
    background: white;
    box-shadow:
      0 0 35px 16px rgba(251,113,133,.5),
      0 0 90px 45px rgba(167,139,250,.2);
    animation:
      maze-light-bloom 1.7s 4.15s
        ease-out forwards;
  }

  .maze-cut-particle {
    position: absolute;
    bottom: -20px;
    width: 5px;
    height: 5px;
    border-radius: 999px;
    opacity: 0;
    background: #fda4af;
    box-shadow: 0 0 10px #fb7185;
    animation:
      maze-particle-rise 4.8s linear infinite;
  }

  .maze-cut-copy {
    opacity: 0;
    transform: translateY(14px);
    animation:
      maze-copy-in 700ms 5.45s
        ease-out forwards;
  }

  .maze-cut-bear {
    width: clamp(76px, 15vw, 108px);
    height: auto;
    overflow: visible;
    filter:
      drop-shadow(
        0 14px 16px rgba(0,0,0,.28)
      );
    animation:
      maze-bear-breathe 1.6s
        ease-in-out infinite alternate;
  }

  .maze-cut-final-embrace {
    position: absolute;
    z-index: 19;
    top: 49%;
    left: 50%;
    width: clamp(190px,42vw,268px);
    opacity: 0;
    transform:
      translate(-50%,-48%)
      scale(.72);
    transform-origin: center;
    filter:
      drop-shadow(
        0 18px 20px rgba(0,0,0,.3)
      );
    animation:
      maze-final-hug-in 780ms 4.78s
        cubic-bezier(.18,.88,.28,1.22) forwards,
      maze-final-hug-breathe 1.8s 5.56s
        ease-in-out infinite;
  }

  .maze-cut-final-embrace svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }

  @keyframes maze-scene-in {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes maze-route-draw {
    from {
      stroke-dashoffset: 1;
      opacity: .2;
    }

    to {
      stroke-dashoffset: 0;
      opacity: 1;
    }
  }

  @keyframes maze-walls-away {
    to {
      opacity: 0;
      filter: blur(5px);
    }
  }

  @keyframes maze-storm-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes maze-storm-away {
    to {
      opacity: 0;
      transform:
        rotate(520deg)
        scale(1.25);
      filter: blur(8px);
    }
  }

  @keyframes maze-guardian-left {
    0% {
      opacity: 0;
      transform:
        translate(-285px,92px)
        scale(.78);
    }

    12% {
      opacity: 1;
    }

    34% {
      transform:
        translate(-220px,16px)
        scale(.86);
    }

    58% {
      transform:
        translate(-145px,56px)
        scale(.92);
    }

    78% {
      transform:
        translate(-128px,-20px)
        scale(.97);
    }

    100% {
      opacity: 1;
      transform:
        translate(-108px,8px);
    }
  }

  @keyframes maze-guardian-right {
    0% {
      opacity: 0;
      transform:
        translate(220px,-88px)
        scale(.78);
    }

    12% {
      opacity: 1;
    }

    34% {
      transform:
        translate(170px,-10px)
        scale(.86);
    }

    58% {
      transform:
        translate(105px,-58px)
        scale(.92);
    }

    78% {
      transform:
        translate(58px,18px)
        scale(.97);
    }

    100% {
      opacity: 1;
      transform:
        translate(8px,8px);
    }
  }

  @keyframes maze-guardian-glow {
    from {
      filter: brightness(1);
    }

    to {
      filter:
        brightness(1.18)
        drop-shadow(
          0 0 10px rgba(255,255,255,.2)
        );
    }
  }

  @keyframes maze-guardian-fade {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
    }
  }

  @keyframes maze-fragment-left {
    0% {
      opacity: 0;
      transform:
        translate(-115px,24px)
        rotate(-35deg)
        scale(.5);
    }

    25% {
      opacity: 1;
    }

    100% {
      opacity: 1;
      transform:
        translate(-18px,0)
        rotate(-8deg);
    }
  }

  @keyframes maze-fragment-right {
    0% {
      opacity: 0;
      transform:
        translate(90px,24px)
        rotate(35deg)
        scale(.5);
    }

    25% {
      opacity: 1;
    }

    100% {
      opacity: 1;
      transform:
        translate(-2px,0)
        rotate(8deg);
    }
  }

  @keyframes maze-heart-unite {
    0% {
      opacity: 0;
      transform:
        translate(-50%,10px)
        scale(.15);
    }

    72% {
      opacity: 1;
      transform:
        translate(-50%,-4px)
        scale(1.16);
    }

    100% {
      opacity: 1;
      transform:
        translate(-50%,0)
        scale(1);
    }
  }

  @keyframes maze-heart-away {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
    }
  }

  @keyframes maze-light-bloom {
    0% {
      opacity: 0;
      transform:
        translate(-50%,-50%)
        scale(0);
    }

    38% {
      opacity: .9;
    }

    100% {
      opacity: .16;
      transform:
        translate(-50%,-50%)
        scale(8);
    }
  }

  @keyframes maze-particle-rise {
    0% {
      opacity: 0;
      transform:
        translateY(0)
        scale(.6);
    }

    18% {
      opacity: .8;
    }

    100% {
      opacity: 0;
      transform:
        translateY(-520px)
        scale(1.15);
    }
  }

  @keyframes maze-copy-in {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes maze-bear-breathe {
    from {
      transform:
        translateY(0)
        rotate(-1deg);
    }

    to {
      transform:
        translateY(-4px)
        rotate(1deg);
    }
  }

  @keyframes maze-final-hug-in {
    0% {
      opacity: 0;
      transform:
        translate(-50%,-44%)
        scale(.72);
    }

    68% {
      opacity: 1;
      transform:
        translate(-50%,-50%)
        scale(1.06);
    }

    100% {
      opacity: 1;
      transform:
        translate(-50%,-50%)
        scale(1);
    }
  }

  @keyframes maze-final-hug-breathe {
    0%,
    100% {
      opacity: 1;
      transform:
        translate(-50%,-50%)
        scale(1);
    }

    50% {
      opacity: 1;
      transform:
        translate(-50%,-52%)
        scale(1.015);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .maze-cutscene *,
    .maze-cutscene *::before,
    .maze-cutscene *::after {
      animation-delay: 0ms !important;
      animation-duration: 1ms !important;
      animation-iteration-count: 1 !important;
    }
  }
`;

function CuteBear({
  variant,
}: {
  variant: "boy" | "girl";
}) {
  const boy = variant === "boy";
  const fur = boy ? "#a86f43" : "#d7a875";
  const darkFur = boy ? "#80502f" : "#ad784d";
  const innerEar = boy ? "#e8a88d" : "#f3b9ad";

  return (
    <svg
      viewBox="0 0 160 190"
      className="maze-cut-bear"
      aria-hidden="true"
    >
      <ellipse
        cx="80"
        cy="178"
        rx="48"
        ry="9"
        fill="rgba(0,0,0,.22)"
      />

      <circle cx="42" cy="45" r="24" fill={darkFur} />
      <circle cx="118" cy="45" r="24" fill={darkFur} />
      <circle cx="42" cy="45" r="13" fill={innerEar} />
      <circle cx="118" cy="45" r="13" fill={innerEar} />

      <ellipse cx="80" cy="130" rx="49" ry="52" fill={fur} />
      <ellipse
        cx="80"
        cy="139"
        rx="30"
        ry="34"
        fill={boy ? "#ca9366" : "#ebc49a"}
      />

      <g
        className={`maze-cut-static-arm ${
          boy ? "outer" : "near"
        }`}
      >
        <ellipse
          cx="34"
          cy="128"
          rx="15"
          ry="31"
          fill={fur}
          transform="rotate(18 34 128)"
        />
      </g>

      <g
        className={`maze-cut-static-arm ${
          boy ? "near" : "outer"
        }`}
      >
        <ellipse
          cx="126"
          cy="128"
          rx="15"
          ry="31"
          fill={fur}
          transform="rotate(-18 126 128)"
        />
      </g>

      <ellipse cx="55" cy="169" rx="21" ry="14" fill={darkFur} />
      <ellipse cx="105" cy="169" rx="21" ry="14" fill={darkFur} />

      <circle cx="80" cy="78" r="57" fill={fur} />
      <ellipse
        cx="80"
        cy="92"
        rx="33"
        ry="25"
        fill={boy ? "#d9a77c" : "#f0c9a2"}
      />

      <ellipse cx="59" cy="72" rx="6" ry="8" fill="#241811" />
      <ellipse cx="101" cy="72" rx="6" ry="8" fill="#241811" />
      <circle cx="57" cy="69" r="2" fill="white" />
      <circle cx="99" cy="69" r="2" fill="white" />

      <ellipse cx="80" cy="87" rx="9" ry="7" fill="#382019" />
      <path
        d="M80 93 C78 102 67 103 64 97 M80 93 C82 102 93 103 96 97"
        fill="none"
        stroke="#633c2e"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <ellipse cx="43" cy="91" rx="9" ry="5" fill="#f58e9f" opacity=".65" />
      <ellipse cx="117" cy="91" rx="9" ry="5" fill="#f58e9f" opacity=".65" />

      {boy ? (
        <>
          <path
            d="M43 112 C63 127 98 127 119 111"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path d="M94 119 L114 151 L91 143 Z" fill="#0ea5e9" />
          <circle cx="48" cy="126" r="4" fill="#67e8f9" />
        </>
      ) : (
        <>
          <path
            d="M111 23 C124 8 139 13 136 29 C151 26 153 43 138 49 C126 53 115 43 111 23 Z"
            fill="#fb7185"
          />
          <circle cx="124" cy="32" r="7" fill="#f43f5e" />
          <path
            d="M51 127 C68 139 93 139 109 127"
            fill="none"
            stroke="#f472b6"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M80 141 C72 130 55 136 57 149 C59 160 80 170 80 170 C80 170 101 160 103 149 C105 136 88 130 80 141 Z"
            fill="#fb7185"
          />
        </>
      )}

    </svg>
  );
}

function HuggingBears() {
  const boyFur = "#a86f43";
  const boyDark = "#80502f";
  const girlFur = "#d7a875";
  const girlDark = "#ad784d";

  return (
    <svg
      viewBox="0 0 320 220"
      aria-hidden="true"
    >
      <defs>
        <radialGradient
          id="maze-final-glow"
          cx="50%"
          cy="48%"
          r="55%"
        >
          <stop
            offset="0"
            stopColor="#fda4af"
            stopOpacity=".32"
          />
          <stop
            offset="1"
            stopColor="#a78bfa"
            stopOpacity="0"
          />
        </radialGradient>
      </defs>

      <ellipse
        cx="160"
        cy="111"
        rx="145"
        ry="105"
        fill="url(#maze-final-glow)"
      />
      <ellipse
        cx="160"
        cy="204"
        rx="103"
        ry="11"
        fill="rgba(0,0,0,.2)"
      />

      <path
        d="M143 130 C178 108 229 118 253 155"
        fill="none"
        stroke={boyFur}
        strokeWidth="21"
        strokeLinecap="round"
      />
      <path
        d="M177 130 C142 108 91 118 67 155"
        fill="none"
        stroke={girlFur}
        strokeWidth="21"
        strokeLinecap="round"
      />

      <ellipse
        cx="112"
        cy="151"
        rx="58"
        ry="57"
        fill={boyFur}
      />
      <ellipse
        cx="208"
        cy="151"
        rx="58"
        ry="57"
        fill={girlFur}
      />
      <ellipse
        cx="112"
        cy="158"
        rx="31"
        ry="36"
        fill="#ca9366"
      />
      <ellipse
        cx="208"
        cy="158"
        rx="31"
        ry="36"
        fill="#ebc49a"
      />

      <ellipse
        cx="84"
        cy="195"
        rx="24"
        ry="14"
        fill={boyDark}
      />
      <ellipse
        cx="132"
        cy="195"
        rx="24"
        ry="14"
        fill={boyDark}
      />
      <ellipse
        cx="188"
        cy="195"
        rx="24"
        ry="14"
        fill={girlDark}
      />
      <ellipse
        cx="236"
        cy="195"
        rx="24"
        ry="14"
        fill={girlDark}
      />

      <g transform="rotate(6 112 82)">
        <circle
          cx="76"
          cy="46"
          r="24"
          fill={boyDark}
        />
        <circle
          cx="145"
          cy="46"
          r="24"
          fill={boyDark}
        />
        <circle
          cx="76"
          cy="46"
          r="13"
          fill="#e8a88d"
        />
        <circle
          cx="145"
          cy="46"
          r="13"
          fill="#e8a88d"
        />
        <circle
          cx="112"
          cy="84"
          r="54"
          fill={boyFur}
        />
        <ellipse
          cx="112"
          cy="99"
          rx="32"
          ry="24"
          fill="#d9a77c"
        />
        <path
          d="M82 79 Q92 88 102 79"
          fill="none"
          stroke="#241811"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M122 79 Q132 88 142 79"
          fill="none"
          stroke="#241811"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <ellipse
          cx="112"
          cy="94"
          rx="9"
          ry="7"
          fill="#382019"
        />
        <path
          d="M112 100 Q105 109 97 103 M112 100 Q119 109 127 103"
          fill="none"
          stroke="#633c2e"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse
          cx="75"
          cy="99"
          rx="9"
          ry="5"
          fill="#f58e9f"
          opacity=".7"
        />
        <ellipse
          cx="149"
          cy="99"
          rx="9"
          ry="5"
          fill="#f58e9f"
          opacity=".7"
        />
      </g>

      <g transform="rotate(-6 208 82)">
        <circle
          cx="175"
          cy="46"
          r="24"
          fill={girlDark}
        />
        <circle
          cx="244"
          cy="46"
          r="24"
          fill={girlDark}
        />
        <circle
          cx="175"
          cy="46"
          r="13"
          fill="#f3b9ad"
        />
        <circle
          cx="244"
          cy="46"
          r="13"
          fill="#f3b9ad"
        />
        <circle
          cx="208"
          cy="84"
          r="54"
          fill={girlFur}
        />
        <ellipse
          cx="208"
          cy="99"
          rx="32"
          ry="24"
          fill="#f0c9a2"
        />
        <path
          d="M178 79 Q188 88 198 79"
          fill="none"
          stroke="#241811"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M218 79 Q228 88 238 79"
          fill="none"
          stroke="#241811"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <ellipse
          cx="208"
          cy="94"
          rx="9"
          ry="7"
          fill="#382019"
        />
        <path
          d="M208 100 Q201 109 193 103 M208 100 Q215 109 223 103"
          fill="none"
          stroke="#633c2e"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse
          cx="171"
          cy="99"
          rx="9"
          ry="5"
          fill="#f58e9f"
          opacity=".72"
        />
        <ellipse
          cx="245"
          cy="99"
          rx="9"
          ry="5"
          fill="#f58e9f"
          opacity=".72"
        />
        <path
          d="M235 25 C248 10 263 15 260 31 C275 28 277 45 262 51 C250 55 239 45 235 25 Z"
          fill="#fb7185"
        />
        <circle
          cx="248"
          cy="34"
          r="7"
          fill="#f43f5e"
        />
      </g>

      <path
        d="M70 119 C91 133 129 136 151 120"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="11"
        strokeLinecap="round"
      />
      <path
        d="M169 120 C191 136 229 133 250 119"
        fill="none"
        stroke="#f472b6"
        strokeWidth="11"
        strokeLinecap="round"
      />

      <circle
        cx="253"
        cy="155"
        r="11"
        fill={boyFur}
        stroke={boyDark}
        strokeWidth="2"
      />
      <ellipse
        cx="253"
        cy="156"
        rx="5"
        ry="4"
        fill="#ca9366"
        opacity=".75"
      />

      <circle
        cx="67"
        cy="155"
        r="11"
        fill={girlFur}
        stroke={girlDark}
        strokeWidth="2"
      />
      <ellipse
        cx="67"
        cy="156"
        rx="5"
        ry="4"
        fill="#ebc49a"
        opacity=".8"
      />

      <path
        d="M160 35 C151 20 131 27 133 43 C135 57 160 68 160 68 C160 68 185 57 187 43 C189 27 169 20 160 35 Z"
        fill="#fb7185"
        stroke="#fecdd3"
        strokeWidth="3"
      />
    </svg>
  );
}

export function MazeFinishCelebration({
  hostName,
  guestName,
}: MazeFinishCelebrationProps) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Cutscene kemenangan ${hostName} dan ${guestName}`}
      className="maze-cutscene fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_44%,rgba(244,114,182,0.22),transparent_30%),linear-gradient(145deg,rgba(8,8,22,0.98),rgba(18,8,30,0.99))] p-3 text-white backdrop-blur-xl"
    >
      <style>{CSS}</style>

      <section className="relative isolate max-h-[calc(100dvh-24px)] w-[min(95vw,720px)] overflow-auto rounded-[2rem] border border-white/15 bg-[radial-gradient(circle_at_50%_42%,rgba(244,114,182,0.13),transparent_40%),linear-gradient(160deg,rgba(24,18,42,0.97),rgba(9,12,27,0.98))] px-4 py-6 text-center shadow-[0_34px_120px_rgba(0,0,0,0.62)] sm:px-7">
        <div className="pointer-events-none absolute inset-0 z-[7] overflow-hidden">
          {PARTICLES.map(
            ([left, delay], index) => (
              <span
                key={index}
                className="maze-cut-particle"
                style={{
                  left,
                  animationDelay: delay,
                }}
              />
            ),
          )}
        </div>

        <p className="relative z-20 text-[10px] font-black tracking-[0.24em] text-rose-300">
          JALAN PULANG DITEMUKAN
        </p>

        <div
          className="relative mx-auto -mb-1 mt-1 aspect-[640/390] w-full max-w-[640px]"
          aria-hidden="true"
        >
          <div className="maze-cut-storm" />

          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 640 390"
          >
            <defs>
              <linearGradient
                id="maze-cut-left"
                x1="0"
                y1="1"
                x2="1"
                y2="0"
              >
                <stop
                  offset="0"
                  stopColor="#22d3ee"
                />
                <stop
                  offset="1"
                  stopColor="#c4b5fd"
                />
              </linearGradient>

              <linearGradient
                id="maze-cut-right"
                x1="1"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0"
                  stopColor="#fb7185"
                />
                <stop
                  offset="1"
                  stopColor="#f9a8d4"
                />
              </linearGradient>

              <filter
                id="maze-cut-glow"
                x="-30%"
                y="-30%"
                width="160%"
                height="160%"
              >
                <feGaussianBlur
                  stdDeviation="3"
                  result="blur"
                />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              className="maze-cut-walls"
              d="
                M78 74H212V132H155V215H242V304
                M562 78H438V146H497V228H410V309
                M273 62V128H337V91
                M300 294V242H360V282
              "
            />

            <path
              className="maze-cut-route"
              pathLength={1}
              stroke="url(#maze-cut-left)"
              d="
                M42 303
                C112 303 106 197 187 211
                C252 222 232 139 320 196
              "
            />

            <path
              className="maze-cut-route"
              pathLength={1}
              stroke="url(#maze-cut-right)"
              d="
                M598 86
                C526 86 538 187 460 173
                C390 161 414 239 320 196
              "
            />
          </svg>

          <div className="maze-cut-light" />

          <div className="maze-cut-guardian left">
            <div className="maze-cut-hug boy">
              <CuteBear variant="boy" />
            </div>
          </div>

          <div className="maze-cut-guardian right">
            <div className="maze-cut-hug girl">
              <CuteBear variant="girl" />
            </div>
          </div>

          <span className="maze-cut-fragment left">
            ◢
          </span>

          <span className="maze-cut-fragment right">
            ◣
          </span>

          <span className="maze-cut-heart">
            💗
          </span>

          <div className="maze-cut-final-embrace">
            <HuggingBears />
          </div>
        </div>

        <div className="maze-cut-copy relative z-20">
          <h2
            id="maze-ending-title"
            className="mx-auto max-w-xl text-[clamp(27px,6vw,40px)] font-black leading-[1.08]"
          >
            Kalian menemukan jalan pulang.
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-300">
            Kalian tidak keluar karena salah satu lebih
            kuat. Kalian pulang karena tetap saling
            menunjukkan arah, bahkan ketika jalan terasa
            gelap.
          </p>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-500 via-pink-500 to-rose-500 px-5 py-3.5 font-black shadow-[0_14px_38px_rgba(236,72,153,0.26)] transition hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]"
          >
            Lihat akhir perjalanan
          </button>
        </div>
      </section>
    </div>
  );
}
