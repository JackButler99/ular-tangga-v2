import { notFound } from "next/navigation";

import { MazeFinishCelebration } from "@/features/games/labirin-rindu/maze-finish-celebration";
import { getServerLocale } from "@/features/platform/i18n/server-locale";

export default async function LabirinCutscenePreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const locale = await getServerLocale();

  return (
    <main className="min-h-screen bg-[#070812] p-8 text-white">
      <h1 className="text-2xl font-black">
        {locale === "id"
          ? "Pratinjau cutscene Labirin Rindu"
          : "Maze of Longing cutscene preview"}
      </h1>

      <p className="mt-3 text-zinc-400">
        {locale === "id"
          ? "Tutup cutscene untuk melihat halaman ini. Muat ulang browser untuk memutar animasi kembali."
          : "Close the cutscene to view this page. Reload the browser to replay the animation."}
      </p>

      <MazeFinishCelebration
        hostName="Ara"
        guestName="Bima"
      />
    </main>
  );
}
