import { describe, expect, it } from "vitest";

import {
  PICK_ONE_ROUNDS,
  getLocalizedPickOneRound,
} from "@/features/games/connection-games/content";
import {
  MAZE_MOMENT_PROMPTS,
  getLocalizedMazeMomentPrompt,
} from "@/features/games/labirin-rindu/content";
import {
  MAZE_DANGERS,
  MAZE_SKILLS,
  localizeMazeDanger,
  localizeMazeSkill,
} from "@/features/games/labirin-rindu/rpg-content";
import {
  QUIZ_QUESTIONS,
  getLocalizedQuizQuestion,
} from "@/features/games/seberapa-kenal/questions";
import {
  MOST_LIKELY_QUESTIONS,
  getLocalizedMostLikelyQuestion,
} from "@/features/games/siapa-yang-lebih/questions";
import {
  CHALLENGES,
  getLocalizedChallenge,
} from "@/features/games/ular-tangga/game";

describe("English game content", () => {
  it("covers every Seberapa Kenal Kamu question and option", () => {
    for (const question of QUIZ_QUESTIONS) {
      const english = getLocalizedQuizQuestion(question.id, "en");

      expect(english.prompt).not.toBe(question.prompt);
      expect(english.options).toHaveLength(question.options.length);
      expect(english.options.every(Boolean)).toBe(true);
    }
  });

  it("covers every Siapa yang Lebih question", () => {
    for (const question of MOST_LIKELY_QUESTIONS) {
      const english = getLocalizedMostLikelyQuestion(question.id, "en");

      expect(english).not.toBeNull();
      expect(english?.text).not.toBe(question.text);
    }
  });

  it("covers every Pilih Mana round", () => {
    for (const round of PICK_ONE_ROUNDS) {
      const english = getLocalizedPickOneRound(round.id, "en");

      expect(english.prompt).not.toBe(round.prompt);
      expect(english.reflection).not.toBe(round.reflection);
      expect(english.options).toHaveLength(2);
      expect(english.options.every((option) => option.label.length > 0)).toBe(
        true,
      );
    }
  });

  it("covers maze prompts, skills, and dangers", () => {
    for (const prompt of MAZE_MOMENT_PROMPTS) {
      expect(getLocalizedMazeMomentPrompt(prompt.id, "en").prompt).not.toBe(
        prompt.prompt,
      );
    }

    for (const skill of MAZE_SKILLS) {
      expect(localizeMazeSkill(skill, "en").name).not.toBe(skill.name);
    }

    for (const danger of MAZE_DANGERS) {
      expect(localizeMazeDanger(danger, "en").name).not.toBe(danger.name);
    }
  });

  it("covers every Story Square challenge", () => {
    for (const challenge of CHALLENGES) {
      expect(getLocalizedChallenge(challenge, "en")).not.toBe(challenge);
    }
  });
});
