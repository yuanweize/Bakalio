import { locateQuote } from "../thesis/anchors";
import { textOf } from "../studio/content";
import { HttpError, prisma } from "wasp/server";
import { z } from "zod";
import { composeSection } from "../ai/live";
import { executeAI as executeAIJob } from "wasp/server/jobs";
import { requireProject } from "./operations";

function configuration() {
  if (process.env.AI_ENABLED !== "true")
    throw new HttpError(503, "AI_DISABLED");
  const endpoint = process.env.AI_ENDPOINT,
    key = process.env.AI_API_KEY,
    model = process.env.AI_MODEL,
    providerName = process.env.AI_PROVIDER_NAME?.trim();
  const budget = Number(process.env.AI_DAILY_TOKEN_BUDGET || 0);
  const maxOutputTokens = Number(process.env.AI_MAX_OUTPUT_TOKENS || 1500);
  if (
    !endpoint ||
    !key ||
    !model ||
    !providerName ||
    !Number.isSafeInteger(budget) ||
    budget <= 0 ||
    !Number.isSafeInteger(maxOutputTokens) ||
    maxOutputTokens < 1 ||
    maxOutputTokens > 4000
  )
    throw new HttpError(503, "AI_CONFIGURATION");
  return {
    endpoint,
    key,
    model,
    budget,
    maxOutputTokens,
    allowedHttpOrigin: process.env.AI_ALLOWED_HTTP_ORIGIN,
  };
}
export async function enqueueSection(a: Record<string, any>, uid: string) {
  const cfg = configuration();
  if (a.consent !== true) throw new HttpError(400, "AI_CONSENT_REQUIRED");
  const key = z.string().uuid().parse(a.key);
  const section = await prisma.thesisSection.findUnique({
    where: { id: z.string().uuid().parse(a.sectionId) },
    include: {
      document: true,
      project: {
        include: {
          proposal: true,
          blueprints: { orderBy: { version: "desc" }, take: 1 },
        },
      },
    },
  });
  if (!section) throw new HttpError(404, "NOT_FOUND");
  await requireProject(section.projectId, uid);
  if (
    !section.project.proposal?.confirmedAt ||
    !section.project.blueprints[0]?.approvedAt
  )
    throw new HttpError(409, "BLUEPRINT_REQUIRED");
  if (section.kind === "results")
    throw new HttpError(409, "RESULTS_REQUIRE_HUMAN_DATA_REVIEW");
  const comment = a.commentId
    ? await prisma.comment.findFirst({
        where: {
          id: z.string().uuid().parse(a.commentId),
          documentId: section.documentId,
          status: "open",
        },
      })
    : null;
  if (a.commentId && !comment) throw new HttpError(404, "NOT_FOUND");
  if (
    comment &&
    (!comment.quote ||
      locateQuote(textOf(section.document.content as any), comment.quote)
        .status !== "located")
  )
    throw new HttpError(409, "ANCHOR_REQUIRES_MANUAL_EDIT");
  const input = {
    ...(comment
      ? {
          revision: {
            commentId: comment.id,
            commentVersion: comment.version,
            originalText: comment.quote,
            instruction: comment.body,
            scope:
              "Return only replacement text for originalText, never the whole section.",
          },
        }
      : {}),
    documentVersion: section.document.version,
    language: section.project.language,
    section: {
      id: section.id,
      version: section.version,
      title: section.title,
      kind: section.kind,
      requirements: section.requirements,
      targetWords: section.targetWords,
    },
    proposal: section.project.proposal.requirements,
    blueprint: section.project.blueprints[0].structure,
  };
  const reserve =
    Buffer.byteLength(JSON.stringify(input), "utf8") +
    cfg.maxOutputTokens +
    1000;
  const submission = await prisma.$transaction(
    async (tx) => {
      const existing = await tx.aIJob.findUnique({
        where: { userId_key: { userId: uid, key } },
      });
      if (existing) {
        if (
          existing.sectionId !== section.id ||
          (existing.input as any)?.revision?.commentId !== comment?.id
        )
          throw new HttpError(409, "IDEMPOTENCY_CONFLICT");
        return { job: existing, created: false };
      }
      if (
        await tx.aIJob.count({
          where: { userId: uid, status: { in: ["queued", "running"] } },
        })
      )
        throw new HttpError(429, "TASK_IN_PROGRESS");
      const day = new Date();
      day.setUTCHours(0, 0, 0, 0);
      const used = await tx.aIJob.aggregate({
        where: { userId: uid, createdAt: { gte: day } },
        _sum: { reservedTokens: true },
      });
      if ((used._sum.reservedTokens || 0) + reserve > cfg.budget)
        throw new HttpError(429, "INSUFFICIENT_QUOTA");
      const changed = await tx.thesisSection.updateMany({
        where: {
          id: section.id,
          version: section.version,
          status: {
            in: [
              "ready",
              "draft",
              "revision_requested",
              "failed",
              "needs_human_input",
            ],
          },
        },
        data: { status: "generating", version: { increment: 1 } },
      });
      if (!changed.count) throw new HttpError(409, "SECTION_NOT_READY");
      const job = await tx.aIJob.create({
        data: {
          userId: uid,
          key,
          type: comment ? "revision" : "section",
          sectionId: section.id,
          status: "queued",
          promptVersion: "section-v1",
          input,
          provider: cfg.endpoint,
          model: cfg.model,
          reservedTokens: reserve,
        },
      });
      return { job, created: true };
    },
    { isolationLevel: "Serializable" },
  );
  if (submission.created)
    await executeAIJob.submit({ jobId: submission.job.id }, { retryLimit: 0 });
  return { id: submission.job.id, status: submission.job.status };
}
export async function executeAI({ jobId }: { jobId: string }) {
  const job = await prisma.aIJob.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "queued") return;
  const claimed = await prisma.aIJob.updateMany({
    where: { id: jobId, status: "queued", cancelRequested: false },
    data: { status: "running", startedAt: new Date() },
  });
  if (!claimed.count) return;
  const abort = new AbortController();
  const timer = setInterval(() => {
    void prisma.aIJob
      .findUnique({ where: { id: jobId }, select: { cancelRequested: true } })
      .then((j) => {
        if (j?.cancelRequested) abort.abort();
      })
      .catch(() => abort.abort());
  }, 1000);
  try {
    const cfg = configuration();
    if (cfg.endpoint !== job.provider || cfg.model !== job.model)
      throw Error("CONFIGURATION_CHANGED");
    const { result, usage } = await composeSection(
      cfg,
      job.input,
      AbortSignal.any([abort.signal, AbortSignal.timeout(60000)]),
    );
    await prisma.$transaction(async (tx) => {
      const current = await tx.aIJob.findUniqueOrThrow({
        where: { id: jobId },
      });
      await tx.aIJob.update({
        where: { id: jobId },
        data: {
          status: current.cancelRequested ? "cancelled" : "completed",
          output: current.cancelRequested ? undefined : result,
          inputTokens: usage.prompt_tokens,
          outputTokens: usage.completion_tokens,
          reservedTokens: usage.prompt_tokens + usage.completion_tokens,
          completedAt: new Date(),
        },
      });
      await tx.usageEvent.create({
        data: {
          userId: job.userId,
          kind: "ai.tokens",
          units: usage.prompt_tokens + usage.completion_tokens,
        },
      });
      await tx.thesisSection.updateMany({
        where: { id: job.sectionId!, status: "generating" },
        data: {
          status: current.cancelRequested ? "ready" : "needs_review",
          version: { increment: 1 },
        },
      });
    });
  } catch {
    // Failed/ambiguous calls keep their reservation: upstream may have charged.
    await prisma.aIJob.update({
      where: { id: jobId },
      data: {
        status: abort.signal.aborted ? "cancelled" : "failed",
        error: abort.signal.aborted
          ? "CANCELLED"
          : "PROVIDER_OR_OUTPUT_FAILURE",
        completedAt: new Date(),
      },
    });
    await prisma.thesisSection.updateMany({
      where: { id: job.sectionId!, status: "generating" },
      data: { status: "failed", version: { increment: 1 } },
    });
  } finally {
    clearInterval(timer);
  }
}
