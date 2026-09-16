import type { Metadata } from "next";
import QuizGame from "@/features/games/seberapa-kenal/quiz-game";

export const metadata: Metadata = {
  title: "Seberapa Kenal Kamu?",
  description:
    "Tebak pilihan pasangan dan lihat seberapa baik kalian saling mengenal.",
};

export default function SeberapaKenalPage() {
  return <QuizGame />;
}