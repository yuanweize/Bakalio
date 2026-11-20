export type RichNode = {
  type: string;
  text?: string;
  attrs?: Record<string, any>;
  content?: RichNode[];
  marks?: { type: string; attrs?: Record<string, any> }[];
};
const nodes = new Set([
  "doc",
  "paragraph",
  "text",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "hardBreak",
  "horizontalRule",
  "codeBlock",
  "table",
  "tableRow",
  "tableCell",
  "tableHeader",
  "citation",
]);
export function validateContent(
  value: unknown,
  depth = 0,
): asserts value is RichNode {
  if (depth > 40 || !value || typeof value !== "object")
    throw new Error("INVALID_CONTENT");
  const n = value as RichNode;
  if (
    !nodes.has(n.type) ||
    (n.text !== undefined && typeof n.text !== "string")
  )
    throw new Error("INVALID_CONTENT");
  for (const mark of n.marks || []) {
    if (
      !["bold", "italic", "strike", "code", "link", "underline"].includes(
        mark.type,
      )
    )
      throw new Error("INVALID_CONTENT");
    if (
      mark.type === "link" &&
      !/^(https?:\/\/|mailto:)/i.test(mark.attrs?.href || "")
    )
      throw new Error("INVALID_LINK");
  }
  for (const c of n.content || []) validateContent(c, depth + 1);
}
export function textOf(n: RichNode): string {
  return n.type === "citation"
    ? `[${n.attrs?.label || "source"}]`
    : (n.text ??
        (n.content || [])
          .map(textOf)
          .join(
            ["doc", "blockquote", "bulletList", "orderedList"].includes(n.type)
              ? "\n\n"
              : "",
          ));
}
export function markdownOf(n: RichNode): string {
  const inner = (n.content || [])
    .map(markdownOf)
    .join(
      ["doc", "bulletList", "orderedList", "blockquote", "table"].includes(
        n.type,
      )
        ? "\n\n"
        : "",
    );
  switch (n.type) {
    case "text":
      return n.text || "";
    case "heading":
      return "#".repeat(n.attrs?.level || 2) + " " + inner;
    case "listItem":
      return "- " + inner;
    case "blockquote":
      return inner
        .split("\n")
        .map((x) => "> " + x)
        .join("\n");
    case "citation":
      return `[${n.attrs?.label || "source"}]`;
    case "hardBreak":
      return "\n";
    case "tableRow":
      return "| " + (n.content || []).map(markdownOf).join(" | ") + " |\n";
    default:
      return inner;
  }
}
export const wordCount = (n: RichNode) => {
  const text = textOf(n);
  return (text.match(/[\p{Script=Han}]|[\p{L}\p{N}]+/gu) || []).length;
};
