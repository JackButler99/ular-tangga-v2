import type { AppLocale } from "@/features/platform/i18n/locale";

import { MAZE_DANGERS_EN, MAZE_SKILLS_EN } from "./rpg-content.en";

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

export function localizeMazeSkill(
  skill: MazeSkillDefinition,
  locale: AppLocale,
): MazeSkillDefinition {
  return locale === "id"
    ? skill
    : { ...skill, ...MAZE_SKILLS_EN[skill.id] };
}

export function localizeMazeDanger(
  danger: MazeDangerDefinition,
  locale: AppLocale,
): MazeDangerDefinition {
  return locale === "id"
    ? danger
    : { ...danger, ...MAZE_DANGERS_EN[danger.id] };
}

export function localizeMazeHistoryText(
  value: string,
  locale: AppLocale,
) {
  if (locale === "id") return value;

  let translated = value
    .replace(/^Pasangan /, "Partner ")
    .replace(/^Kalian memasuki labirin\. Bahaya dirimu hanya terlihat oleh pasanganmu\.$/, "You entered the maze. Only your partner can see the dangers around you.")
    .replace(/^Dua Fragmen Hati bersatu\. Badai Pemisah bangkit untuk menguji kalian\.$/, "The two Heart Fragments joined. The Storm of Separation rose to test you.")
    .replace(/^Bayangan Sepi berhasil menyusul (.+)\.$/, "The Shadow of Loneliness caught up with $1.")
    .replace(/^(.+) mengirim rute (\d+) langkah\.$/, "$1 sent a $2-step route.")
    .replace(/^Kalian akhirnya bertemu\. Hati dipulihkan dan Energi Ikatan terisi penuh\.$/, "You finally met. Your Hearts were restored and Bond Energy was fully replenished.")
    .replace(/^(.+) menabrak dinding\. Rangkaian langkah terhenti\.$/, "$1 hit a wall. The remaining route was cancelled.")
    .replace(/^(.+) menemukan Fragmen Hati\.$/, "$1 found a Heart Fragment.")
    .replace(/^(.+) sudah membawa satu Fragmen Hati\. Sisakan fragmen ini untuk pasangan\.$/, "$1 already carries a Heart Fragment. Leave this one for their partner.")
    .replace(/^(.+) menemukan Altar Ikatan\.$/, "$1 found a Bond Altar.")
    .replace(/^Cahaya terakhir padam di dalam labirin\.$/, "The final Journey Light went out inside the maze.")
    .replace(/^Cahaya terakhir padam sebelum perjalanan selesai\.$/, "The final Journey Light went out before the journey was complete.")
    .replace(/^(.+) menyelesaikan (\d+) langkah\.$/, "$1 completed $2 steps.")
    .replace(/^Salah satu hati padam sebelum perjalanan selesai\.$/, "One player's Hearts ran out before the journey was complete.")
    .replace(/^(.+) menghadapi bahaya tanpa perlindungan\.$/, "$1 faced the danger without protection.")
    .replace(/^Badai memisahkan kalian sebelum perlindungan sempat terbentuk\.$/, "The storm separated you before your protection could take hold.")
    .replace(/^Kalian saling melindungi sampai Badai Pemisah akhirnya reda\.$/, "You protected each other until the Storm of Separation finally subsided.")
    .replace(/^Gelombang (\d+) terlewati\. Badai kembali menguat\.$/, "Wave $1 passed. The storm is gathering strength again.");

  for (const skill of MAZE_SKILLS) {
    const englishName = MAZE_SKILLS_EN[skill.id].name;
    translated = translated
      .replace(
        new RegExp(`^(.+) memperoleh ${skill.name} untuk menjaga pasangannya\\.$`),
        `$1 gained ${englishName} to protect their partner.`,
      )
      .replace(
        new RegExp(`^(.+) menggunakan ${skill.name} untuk pasangannya\\.$`),
        `$1 used ${englishName} for their partner.`,
      )
      .replace(
        new RegExp(`^(.+) melindungi pasangannya dengan ${skill.name}\\.$`),
        `$1 protected their partner with ${englishName}.`,
      );
  }

  return translated;
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
