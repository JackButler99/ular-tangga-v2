import type { Metadata } from "next";

import ConnectionGame from "@/features/games/connection-games/connection-game";
import { PICK_ONE_SLUG } from "@/features/platform/game-registry";

export const metadata: Metadata = {
  title: "Pilih Mana? | Main Berdua",
  description:
    "Pilih satu dari dua kemungkinan secara rahasia bersama pasanganmu.",
};

export default function PickOnePage() {
  return <ConnectionGame gameSlug={PICK_ONE_SLUG} />;
}
