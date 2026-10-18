import type { MazeDangerKind, MazeSkillId } from "./rpg-content";

export const MAZE_SKILLS_EN: Record<
  MazeSkillId,
  { name: string; description: string }
> = {
  "peluk-pelindung": { name: "Protective Embrace", description: "Prevents the damage your partner is about to receive." },
  "pegangan-erat": { name: "Bond Core", description: "Increases Bond Energy capacity by 2 and immediately restores 2 Bond Energy." },
  "bisikan-tenang": { name: "Calming Words", description: "Clears the fog and echoes that disrupt your direction." },
  "mata-hati": { name: "Heart's Sight", description: "Reveals every danger pursuing your partner for two rounds." },
  "cahaya-kenangan": { name: "Light of Memory", description: "Restores four shared Journey Lights." },
  "langkah-seirama": { name: "Synchronized Steps", description: "Lets your partner see their own walls on the next route." },
  "sentuhan-hangat": { name: "Warm Touch", description: "Restores one of your partner's Hearts, up to the maximum of three." },
  "bagi-beban": { name: "Share the Burden", description: "Cancels any danger, but the protector loses one Heart." },
  "janji-pulang": { name: "Promise to Return", description: "A rare protection that cancels any danger without sacrifice." },
};

export const MAZE_DANGERS_EN: Record<
  MazeDangerKind,
  { name: string; description: string; consequence: string }
> = {
  "duri-sunyi": { name: "Thorns of Silence", description: "Thorns grow in a corridor that appears safe.", consequence: "Your partner loses one Heart." },
  "kabut-ragu": { name: "Fog of Doubt", description: "The fog erases your trail and consumes precious time.", consequence: "Three Journey Lights go out." },
  "arus-jarak": { name: "Wave of Distance", description: "A wave pulls the traveler back to the previous square.", consequence: "Move back one square and lose one Heart." },
  "gema-salah-paham": { name: "Echo of Misunderstanding", description: "A false voice breaks the rhythm of your journey.", consequence: "All Bond Energy is lost." },
  "bayangan-sepi": { name: "Shadow of Loneliness", description: "A shadow moves one square at the end of every round.", consequence: "If caught, your partner loses one Heart." },
};
