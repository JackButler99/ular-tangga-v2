export const MAX_CHAT_MESSAGE_LENGTH = 300;

export function cleanChatMessage(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, MAX_CHAT_MESSAGE_LENGTH);
}