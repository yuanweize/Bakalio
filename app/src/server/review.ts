import { HttpError, prisma } from "wasp/server";
import { z } from "zod";
import { createHash } from "node:crypto";
import { requireDocument } from "./operations";
import { textOf } from "../studio/content";
import { locateQuote } from "../thesis/anchors";
const uuid = z.string().uuid();
export const chunkHash = (text: string) =>
  createHash("sha256").update(text).digest("hex");
export async function reviewAction(a: Record<string, any>, uid: string) {
  const doc = await requireDocument(uuid.parse(a.documentId), uid);
  if (a.kind === "review.comment") {
    const body = z.string().trim().min(1).max(4000).parse(a.body),
      quote = z
        .string()
        .max(4000)
        .parse(a.quote || "");
    if (doc.version !== a.version) throw new HttpError(409, "CONFLICT");
    if (
      quote &&
      locateQuote(textOf(doc.content as any), quote).status !== "located"
    )
      throw new HttpError(409, "ANCHOR_NOT_UNIQUE");
    return prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          documentId: doc.id,
          authorId: uid,
          body,
          quote,
          documentVersion: doc.version,
        },
      });
      await tx.reviewEvent.create({
        data: {
          userId: uid,
          objectId: comment.id,
          objectVersion: 1,
          kind: "comment.created",
          details: { documentId: doc.id, documentVersion: doc.version },
        },
      });
      return comment;
    });
  }
  if (a.kind === "review.resolve")
    return prisma.$transaction(async (tx) => {
      const comment = await tx.comment.findFirst({
        where: { id: uuid.parse(a.id), documentId: doc.id },
      });
      if (!comment) throw new HttpError(404, "NOT_FOUND");
      const status = z.enum(["open", "resolved"]).parse(a.status);
      const result = await tx.comment.updateMany({
        where: { id: comment.id, version: a.version },
        data: { status, version: { increment: 1 } },
      });
      if (!result.count) throw new HttpError(409, "CONFLICT");
      await tx.reviewEvent.create({
        data: {
          userId: uid,
          objectId: comment.id,
          objectVersion: comment.version + 1,
          kind: "comment." + status,
          details: { documentId: doc.id },
        },
      });
      return { ok: true };
    });
  if (a.kind === "review.claim") {
    const text = z.string().trim().min(3).max(4000).parse(a.text);
    if (doc.version !== a.documentVersion) throw new HttpError(409, "CONFLICT");
    if (!textOf(doc.content as any).includes(text))
      throw new HttpError(400, "CLAIM_NOT_IN_DOCUMENT");
    if (a.id) {
      const result = await prisma.claim.updateMany({
        where: { id: uuid.parse(a.id), documentId: doc.id, version: a.version },
        data: { text, documentVersion: doc.version, version: { increment: 1 } },
      });
      if (!result.count) throw new HttpError(409, "CONFLICT");
      return { ok: true };
    }
    return prisma.claim.create({
      data: { documentId: doc.id, text, documentVersion: doc.version },
    });
  }
  if (a.kind === "review.locate") {
    const claim = await prisma.claim.findFirst({
      where: { id: uuid.parse(a.claimId), documentId: doc.id },
    });
    if (!claim) throw new HttpError(404, "NOT_FOUND");
    const source = await prisma.source.findFirst({
      where: { id: uuid.parse(a.sourceId), userId: uid },
      include: { chunks: true },
    });
    if (!source) throw new HttpError(404, "NOT_FOUND");
    const page = z.number().int().positive().parse(a.page),
      quote = z.string().trim().min(3).max(4000).parse(a.quote);
    const chunk = source.chunks.find((c) => c.page === page);
    const found = !!chunk?.text.includes(quote);
    return prisma.claimAssessment.create({
      data: {
        claimId: claim.id,
        claimVersion: claim.version,
        sourceId: source.id,
        sourceVersion: source.version,
        sourceHash: chunkHash(chunk?.text || ""),
        page,
        quote,
        level: found ? "L2" : "L0",
        outcome: found
          ? "text_located"
          : chunk
            ? "quote_not_found"
            : "page_unavailable",
        method: "exact-text-v1",
        actorId: uid,
      },
    });
  }
  if (a.kind === "review.human") {
    const claim = await prisma.claim.findFirst({
      where: { id: uuid.parse(a.claimId), documentId: doc.id },
    });
    if (!claim) throw new HttpError(404, "NOT_FOUND");
    const assessment = await prisma.claimAssessment.findFirst({
      where: { id: uuid.parse(a.assessmentId), claimId: claim.id },
    });
    if (
      !assessment ||
      assessment.claimVersion !== claim.version ||
      claim.documentVersion !== doc.version
    )
      throw new HttpError(409, "STALE_REVIEW");
    const source = await prisma.source.findFirst({
      where: { id: assessment.sourceId, userId: uid },
      include: { chunks: true },
    });
    if (
      !source ||
      source.version !== assessment.sourceVersion ||
      chunkHash(
        source.chunks.find((c) => c.page === assessment.page)?.text || "",
      ) !== assessment.sourceHash
    )
      throw new HttpError(409, "STALE_REVIEW");
    const decision = z
      .enum([
        "supported",
        "partially_supported",
        "contradicted",
        "insufficient_evidence",
        "source_unavailable",
      ])
      .parse(a.decision);
    if (decision === "supported" && assessment.level !== "L2")
      throw new HttpError(400, "TEXT_NOT_LOCATED");
    return prisma.reviewEvent.create({
      data: {
        userId: uid,
        objectId: claim.id,
        objectVersion: claim.version,
        kind: "human.review",
        details: {
          assessmentId: assessment.id,
          sourceVersion: source.version,
          documentVersion: doc.version,
          decision,
          note: z
            .string()
            .max(2000)
            .parse(a.note || ""),
        },
      },
    });
  }
  throw new HttpError(400, "INVALID");
}
