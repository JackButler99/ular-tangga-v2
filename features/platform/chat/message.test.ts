import { describe, expect, it } from "vitest";

import {
  cleanChatMessage,
  MAX_CHAT_MESSAGE_LENGTH,
} from "@/features/platform/chat/message";

describe("cleanChatMessage", () => {
  it("membersihkan spasi berlebih", () => {
    expect(
      cleanChatMessage("  Aku   sayang\n kamu  "),
    ).toBe("Aku sayang kamu");
  });

  it("menolak nilai yang bukan teks", () => {
    expect(cleanChatMessage(null)).toBe("");
    expect(cleanChatMessage(123)).toBe("");
  });

  it("membatasi panjang pesan", () => {
    const message = cleanChatMessage("a".repeat(500));

    expect(message).toHaveLength(
      MAX_CHAT_MESSAGE_LENGTH,
    );
  });
});