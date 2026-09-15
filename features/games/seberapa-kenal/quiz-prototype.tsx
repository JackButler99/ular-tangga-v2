"use client";

import Link from "next/link";
import { useState } from "react";
import {
  continueQuiz,
  createInitialQuizState,
  getCurrentQuizQuestion,
  otherPlayer,
  submitGuess,
  submitSubjectAnswer,
} from "@/features/games/seberapa-kenal/engine";
import type { PlayerRole } from "@/features/platform/room/types";

function playerName(role: PlayerRole) {
  return role === "host" ? "Pemain A" : "Pemain B";
}

export default function QuizPrototype() {
  const [state, setState] = useState(createInitialQuizState);

  const question = getCurrentQuizQuestion(state);
  const guesser = otherPlayer(state.subject);

  const subjectAnswer =
    state.subjectAnswer === null
      ? null
      : question.options[state.subjectAnswer];

  const guessAnswer =
    state.guessAnswer === null
      ? null
      : question.options[state.guessAnswer];

  const matched =
    state.subjectAnswer !== null &&
    state.guessAnswer !== null &&
    state.subjectAnswer === state.guessAnswer;

  function answerAsSubject(answerIndex: number) {
    setState((current) =>
      submitSubjectAnswer(
        current,
        current.subject,
        answerIndex,
      ),
    );
  }

  function answerAsGuesser(answerIndex: number) {
    setState((current) =>
      submitGuess(
        current,
        otherPlayer(current.subject),
        answerIndex,
      ),
    );
  }

  return (
    <main className="min-h-screen bg-[#090812] px-5 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          ← Kembali ke katalog
        </Link>

        <header className="mt-10">
          <p className="text-xs font-bold tracking-[0.2em] text-violet-400">
            SEBERAPA KENAL KAMU?
          </p>

          <div className="mt-5 flex items-end justify-between gap-5">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Tebak pilihan dia.
              </h1>
              <p className="mt-3 text-zinc-400">
                Prototipe satu perangkat sebelum mode room diaktifkan.
              </p>
            </div>

            <span className="text-sm text-zinc-500">
              {state.phase === "finished"
                ? "Selesai"
                : `Ronde ${state.roundIndex + 1}/${state.questionIds.length}`}
            </span>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-2 gap-3">
          <article className="rounded-2xl border border-pink-400/20 bg-pink-400/10 p-4">
            <span className="text-xs text-zinc-400">Pemain A</span>
            <strong className="mt-2 block text-2xl">
              {state.scores.host}
            </strong>
          </article>

          <article className="rounded-2xl border border-violet-400/20 bg-violet-400/10 p-4">
            <span className="text-xs text-zinc-400">Pemain B</span>
            <strong className="mt-2 block text-2xl">
              {state.scores.guest}
            </strong>
          </article>
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          {state.phase === "finished" ? (
            <div className="py-8 text-center">
              <span className="text-5xl">♥</span>
              <h2 className="mt-6 text-3xl font-bold">
                Permainan selesai!
              </h2>
              <p className="mt-3 text-zinc-400">
                Skor akhir: Pemain A {state.scores.host} —{" "}
                {state.scores.guest} Pemain B
              </p>

              <button
                type="button"
                onClick={() => setState(createInitialQuizState())}
                className="mt-8 rounded-full bg-pink-500 px-6 py-3 font-semibold transition hover:bg-pink-400"
              >
                Main lagi
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-violet-300">
                {state.phase === "subject-answer" &&
                  `${playerName(state.subject)}, pilih jawabanmu secara rahasia.`}

                {state.phase === "guesser-answer" &&
                  `${playerName(guesser)}, tebak jawaban ${playerName(state.subject)}.`}

                {state.phase === "reveal" &&
                  (matched ? "Tebakan kalian cocok!" : "Belum cocok kali ini.")}
              </p>

              <h2 className="mt-4 text-2xl font-bold leading-tight">
                {question.prompt}
              </h2>

              {state.phase === "subject-answer" && (
                <div className="mt-7 grid gap-3">
                  {question.options.map((option, index) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => answerAsSubject(index)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:border-pink-400/50 hover:bg-pink-400/10"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {state.phase === "guesser-answer" && (
                <div className="mt-7">
                  <div className="mb-5 rounded-2xl bg-violet-400/10 p-4 text-sm text-violet-200">
                    Jawaban {playerName(state.subject)} sudah disimpan dan
                    disembunyikan.
                  </div>

                  <div className="grid gap-3">
                    {question.options.map((option, index) => (
                      <button
                        type="button"
                        key={option}
                        onClick={() => answerAsGuesser(index)}
                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:border-violet-400/50 hover:bg-violet-400/10"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {state.phase === "reveal" && (
                <div className="mt-7">
                  <div
                    className={`rounded-2xl border p-5 ${
                      matched
                        ? "border-emerald-400/30 bg-emerald-400/10"
                        : "border-orange-400/30 bg-orange-400/10"
                    }`}
                  >
                    <p className="text-sm text-zinc-400">
                      Jawaban {playerName(state.subject)}
                    </p>
                    <strong className="mt-1 block">
                      {subjectAnswer}
                    </strong>

                    <p className="mt-5 text-sm text-zinc-400">
                      Tebakan {playerName(guesser)}
                    </p>
                    <strong className="mt-1 block">
                      {guessAnswer}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setState((current) => continueQuiz(current))
                    }
                    className="mt-6 w-full rounded-full bg-pink-500 px-6 py-3 font-semibold transition hover:bg-pink-400"
                  >
                    {state.roundIndex + 1 === state.questionIds.length
                      ? "Lihat hasil akhir"
                      : "Ronde berikutnya"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}