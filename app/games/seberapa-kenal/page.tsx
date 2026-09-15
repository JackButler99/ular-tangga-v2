import type { Metadata } from "next";
import QuizPrototype from "@/features/games/seberapa-kenal/quiz-prototype";

export const metadata: Metadata = {
  title: "Seberapa Kenal Kamu?",
  description:
    "Tebak pilihan pasangan dan lihat seberapa baik kalian saling mengenal.",
};

export default function SeberapaKenalPage() {
  return <QuizPrototype />;
}