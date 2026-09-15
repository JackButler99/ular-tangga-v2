import type { Metadata } from "next";
import SnakeLadderGame from "@/features/games/ular-tangga/snake-ladder-game";

export const metadata: Metadata = {
  title: "Ular Tangga Cerita",
  description:
    "Main ular tangga romantis bersama pasangan dari dua perangkat.",
};

export default function UlarTanggaPage() {
  return <SnakeLadderGame />;
}