import { describe, expect, it } from "vitest";
import { blueprintSchema } from "./workflow";
import { templateBlueprint, templates } from "./templates";

describe("user-supplied KPM slide reference", () => {
  it("is explicitly marked as an unverified reference, not a university template", () => {
    expect(templates.find((t) => t.id === "kpm-slide")).toMatchObject({
      discipline: expect.stringContaining("user-provided"),
      kind: expect.stringContaining("unverified"),
    });
  });
  it("has seven ordered chapters with optional discussion", () => {
    for (const language of ["cs", "en", "zh"]) {
      const blocks = templateBlueprint("kpm-slide", language, "Bachelor");
      expect(blocks).toHaveLength(7);
      expect(blueprintSchema.safeParse(blocks).success).toBe(true);
      expect(blocks[5].requirements).toContain("Optional");
      expect(blocks[6].dependencies).not.toContain(blocks[5].key);
    }
  });
  it("scales suggested word counts without changing section meaning", () => {
    expect(templateBlueprint("kpm-slide", "cs", "Master")[0].targetWords).toBe(
      2 * templateBlueprint("kpm-slide", "cs", "Bachelor")[0].targetWords,
    );
  });
});
