import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  HeadingLevel,
  TableOfContents,
  Footer,
  PageNumber,
} from "docx";
import { textOf } from "../studio/content";
type ExportDocument = {
  title: string;
  content: any;
  citations: {
    id: string;
    page: number | null;
    source: {
      id: string;
      title: string;
      authors: string;
      year: string;
      doi: string;
    };
  }[];
};
export function readiness(documents: ExportDocument[]) {
  const warnings: string[] = [];
  if (!documents.length) warnings.push("NO_SECTIONS");
  for (const d of documents) {
    const text = textOf(d.content);
    if (!text.trim()) warnings.push(`EMPTY_SECTION: ${d.title}`);
    if (/\[NEEDS INPUT|\[TODO|TODO:/i.test(text))
      warnings.push(`PLACEHOLDER: ${d.title}`);
    if (!d.citations.length) warnings.push(`NO_CITATIONS: ${d.title}`);
  }
  return warnings;
}
function paragraphs(
  node: any,
  citations: ExportDocument["citations"],
): Paragraph[] {
  if (node.type === "heading")
    return [
      new Paragraph({
        text: textOf(node),
        heading:
          node.attrs?.level === 1
            ? HeadingLevel.HEADING_2
            : HeadingLevel.HEADING_3,
      }),
    ];
  if (node.type === "paragraph")
    return [
      new Paragraph({
        children: (node.content || []).map((child: any) => {
          if (child.type === "citation") {
            const citation = citations.find(
              (c) => c.id === child.attrs?.citationId,
            );
            return new TextRun(
              citation
                ? ` (${citation.source.authors}, ${citation.source.year}${citation.page ? `, p. ${citation.page}` : ""})`
                : " [MISSING CITATION]",
            );
          }
          return new TextRun({
            text: child.text || "",
            bold: child.marks?.some((m: any) => m.type === "bold"),
            italics: child.marks?.some((m: any) => m.type === "italic"),
          });
        }),
      }),
    ];
  return (node.content || []).flatMap((child: any) =>
    paragraphs(child, citations),
  );
}
export async function exportDocx(title: string, documents: ExportDocument[]) {
  const sources = new Map(
    documents.flatMap((d) =>
      d.citations.map((c) => [c.source.id, c.source] as const),
    ),
  );
  const document = new Document({
    creator: "Bakalio",
    title,
    description:
      "Editable generic thesis export. Review institutional requirements before submission.",
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: 24 },
          paragraph: { spacing: { after: 160, line: 360 } },
        },
      },
    },
    sections: [
      {
        properties: {},
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [new TextRun({ children: [PageNumber.CURRENT] })],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
          new Paragraph({
            text: "Draft · Generic academic layout",
            pageBreakBefore: false,
          }),
          new Paragraph({
            text: "Contents",
            pageBreakBefore: true,
            heading: HeadingLevel.HEADING_1,
          }),
          new TableOfContents("Contents", {
            hyperlink: true,
            headingStyleRange: "1-3",
          }),
          ...documents.flatMap((d, i) => [
            new Paragraph({
              text: `${i + 1}. ${d.title}`,
              heading: HeadingLevel.HEADING_1,
              pageBreakBefore: true,
            }),
            ...paragraphs(d.content, d.citations),
          ]),
          new Paragraph({
            text: "References",
            heading: HeadingLevel.HEADING_1,
            pageBreakBefore: true,
          }),
          ...Array.from(sources.values()).map(
            (s) =>
              new Paragraph({
                text: `${s.authors} (${s.year}). ${s.title}.${s.doi ? ` https://doi.org/${s.doi}` : ""}`,
              }),
          ),
        ],
      },
    ],
  });
  return {
    buffer: await Packer.toBuffer(document),
    warnings: readiness(documents),
  };
}
