import { expect, it } from "vitest";
import JSZip from "jszip";
import { exportDocx, readiness } from "./export";
it("exports editable headings, exact citation metadata and bibliography", async () => {
  const doc = {
    title: "Introduction",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "A test claim" },
            { type: "citation", attrs: { citationId: "c1" } },
          ],
        },
      ],
    },
    citations: [
      {
        id: "c1",
        page: 12,
        source: {
          id: "s1",
          authors: "Example Author",
          year: "2026",
          title: "Fictional source",
          doi: "10.0000/fixture",
        },
      },
    ],
  };
  const r = await exportDocx("Fictional thesis", [doc]);
  const zip = await JSZip.loadAsync(r.buffer);
  const xml = await zip.file("word/document.xml")!.async("string");
  expect(xml).toContain("Fictional thesis");
  expect(xml).toContain("Heading1");
  expect(xml).toContain("p. 12");
  expect(xml).toContain("Fictional source");
  expect(xml).toContain("TOC");
  expect(await zip.file("word/footer1.xml")!.async("string")).toContain("PAGE");
  expect(r.warnings).toEqual([]);
});
it("flags empty sections and placeholders without claiming readiness", () => {
  expect(
    readiness([
      {
        title: "Results",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "[NEEDS INPUT: data]" }],
            },
          ],
        },
        citations: [],
      },
    ]),
  ).toEqual(["PLACEHOLDER: Results", "NO_CITATIONS: Results"]);
});
