import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#090812] p-10 text-white">
      <h1 className="text-4xl font-bold">Main Berdua</h1>
      <p className="mt-3 text-zinc-400">
        Pilih permainan untuk quality time kalian.
      </p>

      <Link
        href="/games/ular-tangga"
        className="mt-10 block max-w-sm rounded-3xl border border-pink-400/30 bg-pink-400/10 p-6"
      >
        <h2 className="text-xl font-semibold">Ular Tangga Cerita</h2>
        <p className="mt-3 text-zinc-400">Main sekarang →</p>
      </Link>
    </main>
  );
}