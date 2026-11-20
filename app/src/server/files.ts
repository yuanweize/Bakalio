import { prisma } from "wasp/server";
import type { ExtractSource } from "wasp/server/jobs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { storageRoot } from "./operations";
export const extractSource: ExtractSource<
  { sourceId: string; userId: string },
  void
> = async ({ sourceId, userId }) => {
  const source = await prisma.source.findFirst({
    where: { id: sourceId, userId },
  });
  if (!source?.storageKey) return;
  try {
    const bytes = await readFile(path.join(storageRoot(), source.storageKey));
    const pages: { page: number; text: string }[] = [];
    if (source.mime === "text/plain")
      pages.push({ page: 1, text: bytes.toString("utf8").slice(0, 1000000) });
    else {
      const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const loading = getDocument({
        data: new Uint8Array(bytes),
        useSystemFonts: true,
      });
      const pdf = await loading.promise;
      if (pdf.numPages > 300) throw new Error("PAGE_LIMIT");
      for (let n = 1; n <= pdf.numPages; n++) {
        const page = await pdf.getPage(n);
        const content = await page.getTextContent();
        pages.push({
          page: n,
          text: content.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ")
            .slice(0, 100000),
        });
      }
      await loading.destroy();
    }
    await prisma.$transaction(async (tx) => {
      await tx.sourceChunk.deleteMany({ where: { sourceId } });
      await tx.sourceChunk.createMany({
        data: pages
          .filter((p) => p.text.trim())
          .map((p) => ({ ...p, sourceId })),
      });
      await tx.source.update({
        where: { id: sourceId },
        data: {
          status: pages.some((p) => p.text.trim()) ? "ready" : "needs_ocr",
        },
      });
    });
  } catch {
    await prisma.source.updateMany({
      where: { id: sourceId, userId },
      data: { status: "failed" },
    });
    throw new Error("SOURCE_EXTRACTION_FAILED");
  }
};
