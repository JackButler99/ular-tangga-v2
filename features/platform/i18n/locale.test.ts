import { describe, expect, it } from "vitest";

import {
  APP_LOCALES,
  DEFAULT_APP_LOCALE,
  isAppLocale,
  localeTag,
  localizeText,
} from "./locale";
import { localizeRuntimeText } from "./runtime-text";

describe("app locale", () => {
  it("uses Indonesian as the default and supports English", () => {
    expect(DEFAULT_APP_LOCALE).toBe("id");
    expect(APP_LOCALES).toEqual(["id", "en"]);
    expect(isAppLocale("id")).toBe(true);
    expect(isAppLocale("en")).toBe(true);
    expect(isAppLocale("fr")).toBe(false);
  });

  it("selects localized copy and language tags", () => {
    const copy = { id: "Ruang", en: "Room" } as const;

    expect(localizeText("id", copy)).toBe("Ruang");
    expect(localizeText("en", copy)).toBe("Room");
    expect(localeTag("id")).toBe("id-ID");
    expect(localeTag("en")).toBe("en-US");
  });

  it("localizes runtime errors without altering Indonesian", () => {
    expect(localizeRuntimeText("id", "Ruang tidak ditemukan.")).toBe(
      "Ruang tidak ditemukan.",
    );
    expect(localizeRuntimeText("en", "Ruang tidak ditemukan.")).toBe(
      "Room not found.",
    );
    expect(
      localizeRuntimeText("en", "Pesan maksimal 500 karakter."),
    ).toBe("Messages may contain at most 500 characters.");
    expect(
      localizeRuntimeText(
        "en",
        "Giliran pasanganmu memilih jawaban.",
      ),
    ).toBe("It is your partner's turn to choose an answer.");
    expect(
      localizeRuntimeText(
        "en",
        "Tunggu pasanganmu mengirim rute terlebih dahulu.",
      ),
    ).toBe("Wait for your partner to send a route first.");
  });
});
