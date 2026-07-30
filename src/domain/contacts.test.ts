import { describe, expect, it } from "vitest";
import {
  hasAnyContact,
  legacyContactLabel,
  normalizeTelegram,
  parseLegacyContact,
  phoneHref,
  resolveContacts,
  telegramHref,
  whatsappHref,
} from "./contacts";

describe("contacts", () => {
  it("parses legacy @telegram into telegram channel", () => {
    expect(parseLegacyContact("@nino_tbs")).toEqual({
      phone: "",
      telegram: "nino_tbs",
      whatsapp: "",
    });
  });

  it("parses legacy phone into phone channel", () => {
    expect(parseLegacyContact("+995 555 12 34 56").phone).toContain("995");
  });

  it("prefers structured columns over legacy contact", () => {
    expect(
      resolveContacts({
        phone: "+995 555",
        telegram: "",
        whatsapp: "",
        contact: "@old",
      }),
    ).toEqual({ phone: "+995 555", telegram: "", whatsapp: "" });
  });

  it("falls back to legacy when structured empty", () => {
    expect(
      resolveContacts({
        phone: "",
        telegram: "",
        whatsapp: "",
        contact: "@mariam",
      }).telegram,
    ).toBe("mariam");
  });

  it("builds deep links", () => {
    expect(phoneHref("+995 555 12 34 56")).toBe("tel:+995555123456");
    expect(telegramHref("@nino_tbs")).toBe("https://t.me/nino_tbs");
    expect(whatsappHref("+995 555 12 34 56")).toBe("https://wa.me/995555123456");
  });

  it("requires at least one channel", () => {
    expect(hasAnyContact({ phone: "", telegram: "", whatsapp: "" })).toBe(false);
    expect(hasAnyContact({ phone: "", telegram: "nino", whatsapp: "" })).toBe(
      true,
    );
  });

  it("syncs legacy label from preferred channel", () => {
    expect(
      legacyContactLabel({ phone: "", telegram: "nino", whatsapp: "" }),
    ).toBe("@nino");
    expect(normalizeTelegram("@nino")).toBe("nino");
  });
});
