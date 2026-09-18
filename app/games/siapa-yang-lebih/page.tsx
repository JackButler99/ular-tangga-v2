import type { Metadata } from "next";

import MostLikelyGame from "@/features/games/siapa-yang-lebih/most-likely-game";

export const metadata: Metadata = {
  title: "Siapa yang Lebih?",
  description:
    "Bandingkan jawaban rahasia bersama pasanganmu.",
};

export default function MostLikelyPage() {
  return <MostLikelyGame />;
}