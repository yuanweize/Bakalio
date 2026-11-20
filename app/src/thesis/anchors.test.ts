import { expect, it } from "vitest";
import { locateQuote, replaceQuotedText } from "./anchors";
it("reattaches only unique exact quotes and identifies orphaned/ambiguous anchors", () => {
  expect(locateQuote("new prefix original text", "original text")).toEqual({
    status: "located",
    offset: 11,
  });
  expect(locateQuote("same same", "same").status).toBe("ambiguous");
  expect(locateQuote("replacement", "original").status).toBe("orphaned");
});
it("replaces only the selected text preserving unrelated content and marks", () => {
  const d = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "A claim here.", marks: [{ type: "italic" }] },
        ],
      },
      { type: "paragraph", content: [{ type: "text", text: "Keep me." }] },
    ],
  };
  const result = replaceQuotedText(d, "claim", "careful claim");
  expect(result.content![0].content![0].text).toBe("A careful claim here.");
  expect(result.content![0].content![0].marks).toEqual([{ type: "italic" }]);
  expect(result.content![1]).toEqual(d.content[1]);
  expect(d.content[0].content[0].text).toBe("A claim here.");
});
it("refuses duplicates and cross-node edits rather than corrupting the document", () => {
  expect(() =>
    replaceQuotedText(
      { type: "doc", content: [{ type: "text", text: "same same" }] },
      "same",
      "new",
    ),
  ).toThrow();
  expect(() =>
    replaceQuotedText(
      {
        type: "doc",
        content: [
          { type: "text", text: "two " },
          { type: "text", text: "nodes" },
        ],
      },
      "two nodes",
      "new",
    ),
  ).toThrow();
});
