"use client";

import Image from "next/image";
import { useState } from "react";

type FinishCelebrationProps = {
  winnerName: string;
};

const HEARTS = Array.from({ length: 12 });

const CSS = `
  .love-scene {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: grid;
    place-items: center;
    overflow: hidden;
    padding: 18px;
    color: white;
    background:
      radial-gradient(
        circle at 50% 42%,
        rgba(244, 63, 94, 0.3),
        transparent 35%
      ),
      linear-gradient(
        145deg,
        rgba(20, 10, 38, 0.97),
        rgba(2, 6, 23, 0.99)
      );
    backdrop-filter: blur(12px);
    animation: scene-fade 500ms ease-out both;
  }

  .love-card {
    position: relative;
    width: min(94vw, 660px);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 32px;
    padding: 22px 26px 26px;
    text-align: center;
    background:
      radial-gradient(
        circle at 50% 38%,
        rgba(236, 72, 153, 0.17),
        transparent 44%
      ),
      rgba(18, 12, 34, 0.96);
    box-shadow: 0 32px 110px rgba(0, 0, 0, 0.58);
  }

  .love-label {
    position: relative;
    z-index: 8;
    margin: 0;
    color: #fb7185;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.24em;
  }

  .love-stage {
    position: relative;
    width: min(100%, 600px);
    aspect-ratio: 600 / 410;
    margin: -2px auto -12px;
  }

  .heart-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .heart-body {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    opacity: 0;
    animation:
        draw-heart 2.4s 4.25s ease-in-out forwards,
        reveal-heart 1ms 4.32s forwards;
    }

    .heart-body.right {
        animation-delay: 4.4s, 4.47s;
    }

  .heart-spots {
    fill: none;
    stroke: rgba(255, 255, 255, 0.5);
    stroke-width: 6;
    stroke-linecap: round;
    stroke-dasharray: 0.012 0.065;
    opacity: 0;
    animation:
      show-spots 500ms 6.4s
      ease-out forwards;
  }

  .snake {
    position: absolute;
    top: 21%;
    left: calc(50% - 65px);
    z-index: 6;
    width: 130px;
    height: 200px;
    opacity: 0;
    transform-origin: 50% 18%;
    will-change: transform, opacity;
  }

  .snake.left {
    animation:
      enter-left 4s
        cubic-bezier(0.2, 0.72, 0.25, 1)
        forwards,
      kiss-left 1.8s 4s
        ease-in-out infinite;
  }

  .snake.right {
    animation:
      enter-right 4s
        cubic-bezier(0.2, 0.72, 0.25, 1)
        forwards,
      kiss-right 1.8s 4s
        ease-in-out infinite;
  }

  .snake-image {
    object-fit: contain;
    filter:
      hue-rotate(315deg)
      saturate(1.2)
      drop-shadow(
        0 14px 18px rgba(244, 63, 94, 0.3)
      );
  }

  .snake-image.right {
    transform: scaleX(-1);
    filter:
      hue-rotate(18deg)
      saturate(1.12)
      drop-shadow(
        0 14px 18px rgba(168, 85, 247, 0.3)
      );
  }

  .kiss-heart {
    position: absolute;
    z-index: 9;
    top: 31%;
    left: 50%;
    color: #fff1f2;
    font-size: clamp(30px, 6vw, 48px);
    line-height: 1;
    opacity: 0;
    filter:
      drop-shadow(
        0 0 18px rgba(251, 113, 133, 0.95)
      );
    animation:
      heart-pop 900ms 3.65s
        cubic-bezier(0.2, 0.9, 0.3, 1.4)
        forwards,
      heart-beat 1.35s 4.55s
        ease-in-out infinite;
  }

  .love-copy {
    position: relative;
    z-index: 8;
    opacity: 0;
    transform: translateY(14px);
    animation:
      copy-in 700ms 6.8s
      ease-out forwards;
  }

  .love-copy h2 {
    margin: 0;
    font-size: clamp(27px, 6vw, 40px);
    line-height: 1.08;
  }

  .love-copy p {
    max-width: 450px;
    margin: 10px auto 0;
    color: #cbd5e1;
    font-size: 14px;
    line-height: 1.7;
  }

  .close-button {
    width: 100%;
    margin-top: 22px;
    border: 0;
    border-radius: 16px;
    padding: 14px 20px;
    color: white;
    font: inherit;
    font-weight: 900;
    cursor: pointer;
    background:
      linear-gradient(
        90deg,
        #f43f5e,
        #ec4899
      );
    box-shadow:
      0 12px 34px rgba(236, 72, 153, 0.26);
    transition:
      transform 160ms ease,
      filter 160ms ease;
  }

  .close-button:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
  }

  .close-button:active {
    transform: scale(0.98);
  }

  .particles {
    position: absolute;
    inset: 0;
    z-index: 5;
    overflow: hidden;
    pointer-events: none;
  }

  .particles span {
    position: absolute;
    bottom: -32px;
    color: rgba(251, 113, 133, 0.76);
    font-size: 18px;
    opacity: 0;
    animation:
      particle-rise 6.2s
      linear infinite;
  }

  .particles span:nth-child(1) {
    left: 6%;
    animation-delay: 3.5s;
  }

  .particles span:nth-child(2) {
    left: 14%;
    font-size: 12px;
    animation-delay: 4.8s;
  }

  .particles span:nth-child(3) {
    left: 24%;
    font-size: 22px;
    animation-delay: 4.1s;
  }

  .particles span:nth-child(4) {
    left: 34%;
    font-size: 14px;
    animation-delay: 5.4s;
  }

  .particles span:nth-child(5) {
    left: 44%;
    font-size: 24px;
    animation-delay: 3.8s;
  }

  .particles span:nth-child(6) {
    left: 54%;
    font-size: 13px;
    animation-delay: 5.1s;
  }

  .particles span:nth-child(7) {
    left: 64%;
    font-size: 20px;
    animation-delay: 4.3s;
  }

  .particles span:nth-child(8) {
    left: 74%;
    font-size: 12px;
    animation-delay: 5.7s;
  }

  .particles span:nth-child(9) {
    left: 84%;
    font-size: 23px;
    animation-delay: 4s;
  }

  .particles span:nth-child(10) {
    left: 93%;
    font-size: 15px;
    animation-delay: 5s;
  }

  .particles span:nth-child(11) {
    left: 30%;
    font-size: 11px;
    animation-delay: 6.2s;
  }

  .particles span:nth-child(12) {
    left: 70%;
    font-size: 17px;
    animation-delay: 6.5s;
  }

  @keyframes scene-fade {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes enter-left {
    0% {
      opacity: 0;
      transform:
        translate(-360px, 0)
        rotate(-3deg)
        scale(0.82);
    }

    12% {
      opacity: 1;
    }

    25% {
      transform:
        translate(-285px, -4px)
        rotate(4deg)
        scale(0.88);
    }

    42% {
      transform:
        translate(-205px, 4px)
        rotate(-4deg)
        scale(0.92);
    }

    58% {
      transform:
        translate(-130px, -4px)
        rotate(4deg)
        scale(0.96);
    }

    74% {
      transform:
        translate(-70px, 4px)
        rotate(-3deg)
        scale(1);
    }

    88% {
      transform:
        translate(-40px, 0)
        rotate(5deg)
        scale(1.02);
    }

    100% {
      opacity: 1;
      transform:
        translate(-28px, 0)
        rotate(8deg)
        scale(1.04);
    }
  }

  @keyframes enter-right {
    0% {
      opacity: 0;
      transform:
        translate(360px, 0)
        rotate(3deg)
        scale(0.82);
    }

    12% {
      opacity: 1;
    }

    25% {
      transform:
        translate(285px, -4px)
        rotate(-4deg)
        scale(0.88);
    }

    42% {
      transform:
        translate(205px, 4px)
        rotate(4deg)
        scale(0.92);
    }

    58% {
      transform:
        translate(130px, -4px)
        rotate(-4deg)
        scale(0.96);
    }

    74% {
      transform:
        translate(70px, 4px)
        rotate(3deg)
        scale(1);
    }

    88% {
      transform:
        translate(40px, 0)
        rotate(-5deg)
        scale(1.02);
    }

    100% {
      opacity: 1;
      transform:
        translate(28px, 0)
        rotate(-8deg)
        scale(1.04);
    }
  }

  @keyframes kiss-left {
    0%,
    100% {
      opacity: 1;
      transform:
        translate(-28px, 0)
        rotate(8deg)
        scale(1.04);
    }

    50% {
      opacity: 1;
      transform:
        translate(-25px, -2px)
        rotate(9deg)
        scale(1.08);
    }
  }

  @keyframes kiss-right {
    0%,
    100% {
      opacity: 1;
      transform:
        translate(28px, 0)
        rotate(-8deg)
        scale(1.04);
    }

    50% {
      opacity: 1;
      transform:
        translate(25px, -2px)
        rotate(-9deg)
        scale(1.08);
    }
  }
    @keyframes reveal-heart {
        to {
            opacity: 1;
        }
    }

  @keyframes draw-heart {
    from {
      stroke-dashoffset: 1;
    }

    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes show-spots {
    from {
      opacity: 0;
    }

    to {
      opacity: 0.72;
    }
  }

  @keyframes heart-pop {
    0% {
      opacity: 0;
      transform:
        translate(-50%, 12px)
        scale(0);
    }

    70% {
      opacity: 1;
      transform:
        translate(-50%, 0)
        scale(1.35);
    }

    100% {
      opacity: 1;
      transform:
        translate(-50%, 0)
        scale(1);
    }
  }

  @keyframes heart-beat {
    0%,
    100% {
      transform:
        translate(-50%, 0)
        scale(1);
    }

    50% {
      transform:
        translate(-50%, 0)
        scale(1.16);
    }
  }

  @keyframes copy-in {
    from {
      opacity: 0;
      transform: translateY(14px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes particle-rise {
    0% {
      opacity: 0;
      transform:
        translateY(0)
        rotate(0deg)
        scale(0.65);
    }

    15% {
      opacity: 0.9;
    }

    100% {
      opacity: 0;
      transform:
        translateY(-720px)
        rotate(45deg)
        scale(1.25);
    }
  }

  @media (max-width: 520px) {
    .love-card {
      border-radius: 24px;
      padding: 20px 16px 22px;
    }

    .snake {
      top: 18%;
      left: calc(50% - 50px);
      width: 100px;
      height: 160px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .love-scene,
    .love-scene * {
      animation-delay: 0ms !important;
      animation-duration: 1ms !important;
      animation-iteration-count: 1 !important;
    }
  }
`;

export function FinishCelebration({
  winnerName,
}: FinishCelebrationProps) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return null;
  }

  return (
    <div
      className="love-scene"
      role="dialog"
      aria-modal="true"
      aria-labelledby="love-title"
    >
      <style>{CSS}</style>

      <section className="love-card">
        <div
          className="particles"
          aria-hidden="true"
        >
          {HEARTS.map((_, index) => (
            <span key={index}>♥</span>
          ))}
        </div>

        <p className="love-label">
          A LITTLE LOVE CUTSCENE
        </p>

        <div
          className="love-stage"
          aria-hidden="true"
        >
          <svg
            className="heart-svg"
            viewBox="0 0 600 410"
          >
            <defs>
              <linearGradient
                id="left-heart-gradient"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop
                  offset="0"
                  stopColor="#a78bfa"
                />

                <stop
                  offset="1"
                  stopColor="#f472b6"
                />
              </linearGradient>

              <linearGradient
                id="right-heart-gradient"
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
                  stopColor="#fbbf24"
                />
              </linearGradient>

              <filter
                id="heart-glow"
                x="-40%"
                y="-40%"
                width="180%"
                height="180%"
              >
                <feGaussianBlur
                  stdDeviation="5"
                  result="blur"
                />

                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              className="heart-body"
              d="
                M300 365
                C245 330 145 265 145 185
                C145 110 235 90 276 160
              "
              pathLength={1}
              stroke="url(#left-heart-gradient)"
              strokeWidth="28"
              filter="url(#heart-glow)"
            />

            <path
              className="heart-body right"
              d="
                M300 365
                C355 330 455 265 455 185
                C455 110 365 90 324 160
              "
              pathLength={1}
              stroke="url(#right-heart-gradient)"
              strokeWidth="28"
              filter="url(#heart-glow)"
            />

            <path
              className="heart-spots"
              d="
                M300 365
                C245 330 145 265 145 185
                C145 110 235 90 276 160
              "
              pathLength={1}
            />

            <path
              className="heart-spots"
              d="
                M300 365
                C355 330 455 265 455 185
                C455 110 365 90 324 160
              "
              pathLength={1}
            />
          </svg>

          <div className="snake left">
            <Image
              src="/assets/snake-cute-v2.png"
              alt=""
              fill
              priority
              sizes="130px"
              className="snake-image"
            />
          </div>

          <div className="snake right">
            <Image
              src="/assets/snake-cute-v2.png"
              alt=""
              fill
              priority
              sizes="130px"
              className="snake-image right"
            />
          </div>

          <span className="kiss-heart">
            ♥
          </span>
        </div>

        <div className="love-copy">
          <h2 id="love-title">
            {winnerName} sampai duluan!
          </h2>

          <p>
            Dua perjalanan, satu tujuan. Permainan selesai,
            tetapi cerita kalian masih terus berjalan. ♥
          </p>

          <button
            className="close-button"
            type="button"
            onClick={() => setOpen(false)}
          >
            Lanjut lihat hasil
          </button>
        </div>
      </section>
    </div>
  );
}