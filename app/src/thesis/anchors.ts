/** Never attach a comment to an arbitrary duplicate match after a document edit. */
export function locateQuote(
  text: string,
  quote: string,
): {
  status: "section" | "located" | "ambiguous" | "orphaned";
  offset: number;
} {
  if (!quote) return { status: "section", offset: -1 };
  const first = text.indexOf(quote);
  if (first < 0) return { status: "orphaned", offset: -1 };
  if (text.indexOf(quote, first + 1) >= 0)
    return { status: "ambiguous", offset: -1 };
  return { status: "located", offset: first };
}

import type { RichNode } from "../studio/content";
/** A safe narrow edit: cross-node or duplicate anchors require manual application. */
export function replaceQuotedText(
  document: RichNode,
  quote: string,
  replacement: string,
): RichNode {
  if (!quote) throw Error("ANCHOR_REQUIRED");
  const clone = structuredClone(document);
  const matches: RichNode[] = [];
  const visit = (node: RichNode) => {
    if (node.type === "text" && node.text?.includes(quote)) matches.push(node);
    for (const child of node.content || []) visit(child);
  };
  visit(clone);
  if (
    matches.length !== 1 ||
    locateQuote(matches[0].text!, quote).status !== "located"
  )
    throw Error("ANCHOR_REQUIRES_MANUAL_EDIT");
  matches[0].text = matches[0].text!.replace(quote, () => replacement);
  return clone;
}
