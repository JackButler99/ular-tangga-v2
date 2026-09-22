export type MazeSkillId =
  | "peluk-pelindung"
  | "pegangan-erat"
  | "bisikan-tenang"
  | "mata-hati"
  | "cahaya-kenangan"
  | "langkah-seirama"
  | "sentuhan-hangat"
  | "bagi-beban"
  | "janji-pulang";

export type MazeDangerKind =
  | "duri-sunyi"
  | "kabut-ragu"
  | "arus-jarak"
  | "gema-salah-paham"
  | "bayangan-sepi";

export type MazeSkillTiming =
  | "danger"
  | "guide"
  | "any";

export type MazeSkillDefinition = {
  id: MazeSkillId;
  name: string;
  emoji: string;
  description: string;
  cost: number;
  timing: MazeSkillTiming;
  counters: readonly MazeDangerKind[];
};

export type MazeDangerDefinition = {
  id: MazeDangerKind;
  name: string;
  emoji: string;
  description: string;
  consequence: string;
};

export const MAZE_SKILLS: readonly MazeSkillDefinition[] = [
  {
    id: "peluk-pelindung",
    name: "Peluk Pelindung",
    emoji: "🫂",
    description: "Menahan luka yang akan diterima pasanganmu.",
    cost: 1,
    timing: "danger",
    counters: ["duri-sunyi", "bayangan-sepi"],
  },
  {
    id: "pegangan-erat",
    name: "Inti Ikatan",
    emoji: "💠",
    description:
      "Meningkatkan kapasitas Energi Ikatan sebesar 2 dan langsung mengisi 2 Ikatan.",
    cost: 0,
    timing: "guide",
    counters: [],
  },
  {
    id: "bisikan-tenang",
    name: "Bisikan Tenang",
    emoji: "💬",
    description: "Membuyarkan kabut dan gema yang mengacaukan arah.",
    cost: 1,
    timing: "danger",
    counters: ["kabut-ragu", "gema-salah-paham"],
  },
  {
    id: "mata-hati",
    name: "Mata Hati",
    emoji: "👁️",
    description: "Melihat seluruh bahaya yang memburu pasangan selama dua giliran.",
    cost: 1,
    timing: "guide",
    counters: [],
  },
  {
    id: "cahaya-kenangan",
    name: "Cahaya Kenangan",
    emoji: "🕯️",
    description: "Mengembalikan empat Cahaya perjalanan bersama.",
    cost: 2,
    timing: "guide",
    counters: [],
  },
  {
    id: "langkah-seirama",
    name: "Langkah Seirama",
    emoji: "🎵",
    description: "Pasangan dapat melihat dindingnya sendiri pada rute berikutnya.",
    cost: 2,
    timing: "guide",
    counters: [],
  },
  {
  id: "sentuhan-hangat",
  name: "Sentuhan Hangat",
  emoji: "💖",
  description:
    "Memulihkan satu Hati pasanganmu hingga maksimum tiga Hati.",
  cost: 2,
  timing: "guide",
  counters: [],
},
  {
    id: "bagi-beban",
    name: "Bagi Beban",
    emoji: "💞",
    description: "Membatalkan bahaya apa pun, tetapi pelindung kehilangan satu Hati.",
    cost: 1,
    timing: "danger",
    counters: [
      "duri-sunyi",
      "kabut-ragu",
      "arus-jarak",
      "gema-salah-paham",
      "bayangan-sepi",
    ],
  },
  {
    id: "janji-pulang",
    name: "Janji Pulang",
    emoji: "🏡",
    description: "Perlindungan langka yang menahan bahaya apa pun tanpa pengorbanan.",
    cost: 3,
    timing: "danger",
    counters: [
      "duri-sunyi",
      "kabut-ragu",
      "arus-jarak",
      "gema-salah-paham",
      "bayangan-sepi",
    ],
  },
] as const;

export const MAZE_DANGERS: readonly MazeDangerDefinition[] = [
  {
    id: "duri-sunyi",
    name: "Duri Sunyi",
    emoji: "🌹",
    description: "Duri tumbuh di lorong yang tampak aman.",
    consequence: "Pasangan kehilangan satu Hati.",
  },
  {
    id: "kabut-ragu",
    name: "Kabut Ragu",
    emoji: "🌫️",
    description: "Kabut menelan jejak dan menghabiskan waktu.",
    consequence: "Tiga Cahaya akan padam.",
  },
  {
    id: "arus-jarak",
    name: "Gelombang Jarak",
    emoji: "🌊",
    description: "Gelombang menarik pejalan kembali ke petak sebelumnya.",
    consequence: "Mundur satu petak dan kehilangan satu Hati.",
  },
  {
    id: "gema-salah-paham",
    name: "Gema Salah Paham",
    emoji: "🌀",
    description: "Suara palsu memutus ritme perjalanan kalian.",
    consequence: "Seluruh energi Ikatan akan hilang.",
  },
  {
    id: "bayangan-sepi",
    name: "Bayangan Sepi",
    emoji: "👤",
    description: "Bayangan bergerak satu petak setiap selesai giliran.",
    consequence: "Jika tertangkap, pasangan kehilangan satu Hati.",
  },
] as const;

export const MAZE_SKILL_IDS = MAZE_SKILLS.map(
  (skill) => skill.id,
);

export const MAZE_DANGER_KINDS = MAZE_DANGERS.map(
  (danger) => danger.id,
);

export function getMazeSkill(id: MazeSkillId) {
  const skill = MAZE_SKILLS.find((entry) => entry.id === id);

  if (!skill) {
    throw new Error("Skill Labirin Rindu tidak ditemukan.");
  }

  return skill;
}

export function getMazeDanger(id: MazeDangerKind) {
  const danger = MAZE_DANGERS.find((entry) => entry.id === id);

  if (!danger) {
    throw new Error("Bahaya Labirin Rindu tidak ditemukan.");
  }

  return danger;
}

export function isMazeSkillId(value: unknown): value is MazeSkillId {
  return (
    typeof value === "string" &&
    MAZE_SKILL_IDS.some((id) => id === value)
  );
}

export function isMazeDangerKind(
  value: unknown,
): value is MazeDangerKind {
  return (
    typeof value === "string" &&
    MAZE_DANGER_KINDS.some((id) => id === value)
  );
}
