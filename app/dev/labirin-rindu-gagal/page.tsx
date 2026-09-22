import { notFound } from "next/navigation";

import { MazeFailureScene } from "@/features/games/labirin-rindu/maze-failure-scene";

export default function LongingMazeFailurePreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <MazeFailureScene reason="Cahaya terakhir padam sebelum perjalanan selesai." />
  );
}
