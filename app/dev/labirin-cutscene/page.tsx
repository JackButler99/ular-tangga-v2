import { notFound } from "next/navigation";

import { MazeFinishCelebration } from "@/features/games/labirin-rindu/maze-finish-celebration";

export default function LabirinCutscenePreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#070812] p-8 text-white">
      <h1 className="text-2xl font-black">
        Preview Cutscene Labirin Rindu
      </h1>

      <p className="mt-3 text-zinc-400">
        Tutup cutscene untuk melihat halaman ini.
        Refresh browser untuk memutar ulang animasi.
      </p>

      <MazeFinishCelebration
        hostName="Ara"
        guestName="Bima"
      />
    </main>
  );
}