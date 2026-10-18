import type { Metadata } from "next";

import CryptogramGame from "@/features/games/cryptogram-cinta/cryptogram-game";

export const metadata: Metadata = {
  title: "Cryptogram Cinta",
  description:
    "Pecahkan kutipan cinta bersama pasangan dan bertahan saat sandi semakin sulit.",
};

export default function CryptogramCintaPage() {
  return <CryptogramGame />;
}
