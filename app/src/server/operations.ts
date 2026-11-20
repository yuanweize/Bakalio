import { reviewAction, chunkHash } from "./review";
import { locateQuote, replaceQuotedText } from "../thesis/anchors";
import { exportDocx } from "./export";
import { verifyMetadata } from "./metadata";
import { enqueueSection } from "./aiTasks";
import { thesisAction } from "./thesis";
import { HttpError, prisma } from "wasp/server";
import type { GetStudio, MutateStudio, Contact } from "wasp/server/operations";
import { extractSource } from "wasp/server/jobs";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { validateContent, textOf } from "../studio/content";

export const storageRoot = () =>
  path.resolve(process.env.PRIVATE_STORAGE_PATH || "../private-storage");
const id = z.string().uuid();
const short = z.string().trim().max(300);
const projectInput = z.object({
  title: short.min(1),
  language: z.enum(["cs", "en", "zh"]),
  thesisType: short,
  discipline: short,
  question: z.string().max(4000),
  method: z.string().max(4000),
  citationStyle: short,
  targetDate: z.string().max(30),
});
const sourceInput = z.object({
  title: short.min(1),
  authors: short,
  year: z.string().max(10),
  doi: short,
  url: z
    .string()
    .max(2000)
    .refine((v) => !v || /^https?:\/\//i.test(v)),
  tags: z.array(short).max(20),
  projectId: id.nullable().optional(),
});
function userId(context: { user?: { id: string } | null }) {
  if (!context.user) throw new HttpError(401, "AUTH");
  return context.user.id;
}
export async function requireProject(projectId: string, uid: string) {
  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId: id.parse(projectId), userId: uid },
    },
  });
  if (!membership) throw new HttpError(404, "NOT_FOUND");
  return membership;
}
export async function requireDocument(documentId: string, uid: string) {
  const doc = await prisma.document.findUnique({
    where: { id: id.parse(documentId) },
  });
  if (!doc) throw new HttpError(404, "NOT_FOUND");
  await requireProject(doc.projectId, uid);
  return doc;
}
async function requireSource(sourceId: string, uid: string) {
  const source = await prisma.source.findFirst({
    where: { id: id.parse(sourceId), userId: uid },
  });
  if (!source) throw new HttpError(404, "NOT_FOUND");
  return source;
}
const admin = (email?: string | null) =>
  !!email &&
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
export const getStudio: GetStudio<
  { projectId?: string; documentId?: string; admin?: boolean },
  any
> = async (args, ctx) => {
  const uid = userId(ctx);
  if (args.admin) {
    if (!admin(ctx.user?.email)) throw new HttpError(403, "FORBIDDEN");
    return {
      users: await prisma.user.findMany({
        select: { id: true, email: true, createdAt: true },
      }),
      jobs: await prisma.aIJob.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
      }),
      messages: await prisma.contactMessage.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
      }),
    };
  }
  if (args.documentId) {
    const doc = await requireDocument(args.documentId, uid);
    const comments = await prisma.comment.findMany({
      where: { documentId: doc.id },
      orderBy: { createdAt: "desc" },
    });
    const claims = await prisma.claim.findMany({
      where: { documentId: doc.id },
      include: { assessments: { orderBy: { createdAt: "desc" } } },
    });
    const ownedSources = await prisma.source.findMany({
      where: { userId: uid },
      include: { chunks: true },
    });
    return {
      ...doc,
      section: await prisma.thesisSection.findUnique({
        where: { documentId: doc.id },
      }),
      comments: comments.map((c) => ({
        ...c,
        anchor: locateQuote(textOf(doc.content as any), c.quote),
      })),
      claims: claims.map((c) => ({
        ...c,
        stale: c.documentVersion !== doc.version,
        assessments: c.assessments.map((a) => {
          const source = ownedSources.find((s) => s.id === a.sourceId);
          return {
            ...a,
            stale:
              c.documentVersion !== doc.version ||
              a.claimVersion !== c.version ||
              !source ||
              source.version !== a.sourceVersion ||
              chunkHash(
                source.chunks.find((s) => s.page === a.page)?.text || "",
              ) !== a.sourceHash,
          };
        }),
      })),
      reviewEvents: await prisma.reviewEvent.findMany({
        where: {
          userId: uid,
          objectId: {
            in: [...comments.map((c) => c.id), ...claims.map((c) => c.id)],
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      revisions: await prisma.documentRevision.findMany({
        where: { documentId: doc.id },
        orderBy: { version: "desc" },
      }),
      citations: await prisma.citation.findMany({
        where: { documentId: doc.id },
        include: { source: true },
      }),
    };
  }
  if (args.projectId) await requireProject(args.projectId, uid);
  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: uid } } },
    include: {
      documents: { orderBy: { updatedAt: "desc" } },
      proposal: true,
      blueprints: { orderBy: { version: "desc" }, take: 1 },
      sections: { orderBy: { position: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });
  const sources = await prisma.source.findMany({
    where: { userId: uid },
    include: {
      chunks: true,
      verificationEvents: { orderBy: { createdAt: "desc" }, take: 10 },
    },
    orderBy: { createdAt: "desc" },
  });
  return {
    projects,
    sources,
    user: await prisma.user.findUnique({
      where: { id: uid },
      select: { email: true, locale: true, theme: true },
    }),
    isAdmin: admin(ctx.user?.email),
    usage: await prisma.usageEvent.aggregate({
      where: { userId: uid },
      _sum: { units: true },
    }),
    jobs: await prisma.aIJob.count({ where: { userId: uid } }),
    aiTasks: await prisma.aIJob.findMany({
      where: { userId: uid },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        sectionId: true,
        type: true,
        status: true,
        output: true,
        error: true,
        inputTokens: true,
        outputTokens: true,
        createdAt: true,
      },
    }),
  };
};
export const mutateStudio: MutateStudio<
  { kind: string; [key: string]: any },
  any
> = async (a, ctx) => {
  const uid = userId(ctx);
  try {
    if (a.kind.startsWith("review.")) return reviewAction(a, uid);
    if (a.kind.startsWith("thesis.") && a.kind !== "thesis.export")
      return await thesisAction(a, uid);
    if (a.kind === "ai.section") return enqueueSection(a, uid);
    if (a.kind === "ai.accept" || a.kind === "ai.reject") {
      return prisma.$transaction(async (tx) => {
        const job = await tx.aIJob.findFirst({
          where: { id: id.parse(a.id), userId: uid, status: "completed" },
        });
        if (!job?.sectionId) throw new HttpError(404, "NOT_FOUND");
        const section = await tx.thesisSection.findUniqueOrThrow({
          where: { id: job.sectionId },
          include: { document: true },
        });
        await requireProject(section.projectId, uid);
        if (a.kind === "ai.accept") {
          const version = z
            .number()
            .int()
            .positive()
            .parse((job.input as any)?.documentVersion);
          const text = z
            .string()
            .max(30000)
            .parse((job.output as any)?.text);
          const revision = (job.input as any)?.revision;
          let nextContent: any = {
            type: "doc",
            content: text.split(/\n+/).map((line) => ({
              type: "paragraph",
              content: [{ type: "text", text: line || " " }],
            })),
          };
          if (revision) {
            const comment = await tx.comment.findFirst({
              where: {
                id: revision.commentId,
                documentId: section.documentId,
                status: "open",
                version: revision.commentVersion,
              },
            });
            if (!comment) throw new HttpError(409, "COMMENT_CHANGED");
            try {
              nextContent = replaceQuotedText(
                section.document.content as any,
                revision.originalText,
                text,
              );
            } catch {
              throw new HttpError(409, "ANCHOR_REQUIRES_MANUAL_EDIT");
            }
            await tx.comment.update({
              where: { id: comment.id },
              data: { status: "resolved", version: { increment: 1 } },
            });
            await tx.reviewEvent.create({
              data: {
                userId: uid,
                objectId: comment.id,
                objectVersion: comment.version + 1,
                kind: "revision.accepted",
                details: { jobId: job.id, documentVersion: version + 1 },
              },
            });
          }
          const updated = await tx.document.updateMany({
            where: { id: section.documentId, version },
            data: {
              content: nextContent,
              version: { increment: 1 },
            },
          });
          if (!updated.count) throw new HttpError(409, "CONFLICT");
          await tx.documentRevision.create({
            data: {
              documentId: section.documentId,
              version: section.document.version,
              title: section.document.title,
              content: section.document.content as any,
            },
          });
        }
        const changed = await tx.aIJob.updateMany({
          where: { id: job.id, status: "completed" },
          data: { status: a.kind === "ai.accept" ? "accepted" : "rejected" },
        });
        if (!changed.count) throw new HttpError(409, "CONFLICT");
        await tx.thesisSection.update({
          where: { id: section.id },
          data: { status: "draft", version: { increment: 1 } },
        });
        await tx.usageEvent.create({
          data: { userId: uid, kind: a.kind, units: 0 },
        });
        return { ok: true };
      });
    }
    if (a.kind === "ai.recover") {
      const job = await prisma.aIJob.findFirst({
        where: { id: id.parse(a.id), userId: uid },
      });
      if (!job || !["queued", "running"].includes(job.status))
        throw new HttpError(404, "NOT_FOUND");
      if (
        Date.now() - new Date(job.startedAt || job.createdAt).getTime() <
        120000
      )
        throw new HttpError(409, "TASK_ACTIVE");
      // Never replay an ambiguous provider request after a process crash.
      return prisma.$transaction(async (tx) => {
        const result = await tx.aIJob.updateMany({
          where: { id: job.id, status: job.status },
          data: {
            status: "failed",
            error: "INTERRUPTED_REVIEW_REQUIRED",
            completedAt: new Date(),
          },
        });
        if (!result.count) throw new HttpError(409, "CONFLICT");
        await tx.thesisSection.updateMany({
          where: { id: job.sectionId!, status: "generating" },
          data: { status: "needs_human_input", version: { increment: 1 } },
        });
        return { ok: true };
      });
    }
    if (a.kind === "ai.cancel") {
      const job = await prisma.aIJob.findFirst({
        where: { id: id.parse(a.id), userId: uid },
      });
      if (!job) throw new HttpError(404, "NOT_FOUND");
      await prisma.aIJob.updateMany({
        where: {
          id: job.id,
          userId: uid,
          status: { in: ["queued", "running"] },
        },
        data: { cancelRequested: true },
      });
      if (job.status === "queued") {
        const cancelled = await prisma.aIJob.updateMany({
          where: { id: job.id, status: "queued" },
          data: { status: "cancelled", reservedTokens: 0 },
        });
        if (cancelled.count)
          await prisma.thesisSection.updateMany({
            where: { id: job.sectionId!, status: "generating" },
            data: { status: "ready", version: { increment: 1 } },
          });
      }
      return { ok: true };
    }
    if (a.kind === "thesis.export") {
      await requireProject(a.projectId, uid);
      const project = await prisma.project.findUniqueOrThrow({
        where: { id: a.projectId },
        include: {
          documents: { include: { citations: { include: { source: true } } } },
          sections: { orderBy: { position: "asc" } },
        },
      });
      const order = new Map(project.sections.map((s, i) => [s.documentId, i]));
      const documents = project.documents.sort(
        (a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999),
      );
      const result = await exportDocx(project.title, documents);
      return {
        base64: result.buffer.toString("base64"),
        warnings: result.warnings,
      };
    }
    switch (a.kind) {
      case "project.create": {
        const data = projectInput.parse(a.data);
        return prisma.project.create({
          data: { ...data, members: { create: { userId: uid } } },
        });
      }
      case "project.update": {
        await requireProject(a.id, uid);
        return prisma.project.update({
          where: { id: a.id },
          data: projectInput.parse(a.data),
        });
      }
      case "project.archive": {
        await requireProject(a.id, uid);
        return prisma.project.update({
          where: { id: a.id },
          data: { archived: z.boolean().parse(a.archived) },
        });
      }
      case "project.delete": {
        await requireProject(a.id, uid);
        return prisma.project.delete({ where: { id: a.id } });
      }
      case "document.create": {
        await requireProject(a.projectId, uid);
        return prisma.document.create({
          data: {
            projectId: a.projectId,
            title: short.min(1).parse(a.title),
            content: { type: "doc", content: [{ type: "paragraph" }] },
          },
        });
      }
      case "document.save":
      case "document.restore": {
        const doc = await requireDocument(a.id, uid);
        const version = z.number().int().positive().parse(a.version);
        let content = a.content;
        let title = short.min(1).parse(a.title);
        if (a.kind === "document.restore") {
          const rev = await prisma.documentRevision.findFirst({
            where: { id: id.parse(a.revisionId), documentId: doc.id },
          });
          if (!rev) throw new HttpError(404, "NOT_FOUND");
          content = rev.content;
          title = rev.title;
        }
        try {
          validateContent(content);
        } catch {
          throw new HttpError(400, "INVALID_CONTENT");
        }
        const citationNodes: any[] = [];
        const visit = (n: any) => {
          if (n.type === "citation") citationNodes.push(n);
          for (const child of n.content || []) visit(child);
        };
        visit(content);
        for (const node of citationNodes) {
          const citation = await prisma.citation.findFirst({
            where: {
              id: node.attrs?.citationId,
              documentId: doc.id,
              sourceId: node.attrs?.sourceId,
            },
          });
          if (!citation) throw new HttpError(400, "INVALID_CITATION");
        }
        if (JSON.stringify(content).length > 2000000)
          throw new HttpError(413, "TOO_LARGE");
        return prisma.$transaction(async (tx) => {
          const result = await tx.document.updateMany({
            where: { id: doc.id, version },
            data: { content, title, version: { increment: 1 } },
          });
          if (result.count !== 1) throw new HttpError(409, "CONFLICT");
          await tx.documentRevision.create({
            data: {
              documentId: doc.id,
              version: doc.version,
              title: doc.title,
              content: doc.content as any,
            },
          });
          await tx.thesisSection.updateMany({
            where: { documentId: doc.id },
            data: { status: "draft", version: { increment: 1 } },
          });
          return tx.document.findUniqueOrThrow({ where: { id: doc.id } });
        });
      }
      case "document.delete": {
        await requireDocument(a.id, uid);
        return prisma.document.delete({ where: { id: a.id } });
      }
      case "source.create": {
        const data = sourceInput.parse(a.data);
        if (data.projectId) await requireProject(data.projectId, uid);
        const quota = await prisma.source.aggregate({
          where: { userId: uid },
          _count: true,
          _sum: { bytes: true },
        });
        if (quota._count >= 500 || (quota._sum.bytes || 0) > 500 * 1024 * 1024)
          throw new HttpError(429, "LIMIT");
        if (!a.file)
          return prisma.source.create({ data: { ...data, userId: uid } });
        const file = z
          .object({
            base64: z.string().max(14000000),
            mime: z.enum(["application/pdf", "text/plain"]),
          })
          .parse(a.file);
        const bytes = Buffer.from(file.base64, "base64");
        if (bytes.length > 10 * 1024 * 1024 || !bytes.length)
          throw new HttpError(413, "TOO_LARGE");
        if (
          file.mime === "application/pdf" &&
          bytes.subarray(0, 5).toString() !== "%PDF-"
        )
          throw new HttpError(400, "FILE_TYPE");
        if (file.mime === "text/plain" && bytes.includes(0))
          throw new HttpError(400, "FILE_TYPE");
        const storageKey = randomUUID();
        await mkdir(storageRoot(), { recursive: true, mode: 0o700 });
        await writeFile(path.join(storageRoot(), storageKey), bytes, {
          mode: 0o600,
          flag: "wx",
        });
        let source;
        try {
          source = await prisma.source.create({
            data: {
              ...data,
              userId: uid,
              storageKey,
              mime: file.mime,
              bytes: bytes.length,
              status: "queued",
            },
          });
        } catch (e) {
          await unlink(path.join(storageRoot(), storageKey));
          throw e;
        }
        await extractSource.submit(
          { sourceId: source.id, userId: uid },
          { retryLimit: 2 },
        );
        return source;
      }
      case "source.verify": {
        const source = await requireSource(a.id, uid);
        if (a.consent !== true)
          throw new HttpError(400, "DOI_LOOKUP_CONSENT_REQUIRED");
        const recent = await prisma.verificationEvent.findFirst({
          where: {
            sourceId: source.id,
            createdAt: { gt: new Date(Date.now() - 60000) },
          },
        });
        if (recent) throw new HttpError(429, "TRY_LATER");
        const result = await verifyMetadata(source);
        return prisma.verificationEvent.create({
          data: {
            sourceId: source.id,
            sourceVersion: source.version,
            actorId: uid,
            level: result.level,
            outcome: result.outcome,
            method: result.method,
            details: result.metadata || {
              reason:
                "DOI not found in Crossref; other registries have not been checked.",
            },
          },
        });
      }
      case "source.update": {
        await requireSource(a.id, uid);
        const data = sourceInput.parse(a.data);
        if (data.projectId) await requireProject(data.projectId, uid);
        return prisma.source.update({
          where: { id: a.id },
          data: { ...data, version: { increment: 1 } },
        });
      }
      case "source.download": {
        const source = await requireSource(a.id, uid);
        if (!source.storageKey) throw new HttpError(404, "NOT_FOUND");
        return {
          base64: (
            await readFile(path.join(storageRoot(), source.storageKey))
          ).toString("base64"),
          mime: source.mime,
        };
      }
      case "source.delete": {
        const source = await requireSource(a.id, uid);
        if (await prisma.citation.count({ where: { sourceId: source.id } }))
          throw new HttpError(409, "SOURCE_IN_USE");
        await prisma.source.delete({ where: { id: source.id } });
        if (source.storageKey)
          await unlink(path.join(storageRoot(), source.storageKey)).catch(
            () => {},
          );
        return { ok: true };
      }
      case "citation.create": {
        const doc = await requireDocument(a.documentId, uid);
        const source = await requireSource(a.sourceId, uid);
        const page = a.page ? z.number().int().positive().parse(a.page) : null;
        return prisma.$transaction(async (tx) => {
          await tx.documentSource.upsert({
            where: {
              documentId_sourceId: { documentId: doc.id, sourceId: source.id },
            },
            create: { documentId: doc.id, sourceId: source.id },
            update: {},
          });
          return tx.citation.create({
            data: { documentId: doc.id, sourceId: source.id, page },
          });
        });
      }
      case "settings":
        return prisma.user.update({
          where: { id: uid },
          data: z
            .object({
              locale: z.enum(["cs", "en", "zh"]),
              theme: z.enum(["light", "dark"]),
            })
            .parse(a.data),
        });
      case "ai": {
        z.enum(["outline", "summarize", "rewrite", "sources"]).parse(a.task);
        if (a.documentId) await requireDocument(a.documentId, uid);
        if (a.sourceId) await requireSource(a.sourceId, uid);
        throw new HttpError(503, "AI_DISABLED");
      }
      default:
        throw new HttpError(400, "INVALID");
    }
  } catch (e) {
    if (e instanceof z.ZodError) throw new HttpError(400, "INVALID");
    throw e;
  }
};
export const contact: Contact<
  { email: string; message: string; website?: string },
  { ok: boolean }
> = async (a) => {
  const data = z
    .object({
      email: z.email().max(200),
      message: z.string().trim().min(10).max(4000),
      website: z.string().optional(),
    })
    .parse(a);
  if (data.website) return { ok: true };
  await prisma.contactMessage.create({
    data: { email: data.email, message: data.message },
  });
  return { ok: true };
};

export const getPublicConfig = async () => ({
  registrationEnabled: process.env.REGISTRATION_ENABLED === "true",
  aiEnabled:
    process.env.AI_ENABLED === "true" &&
    !!process.env.AI_ENDPOINT &&
    !!process.env.AI_API_KEY &&
    !!process.env.AI_MODEL &&
    !!process.env.AI_PROVIDER_NAME?.trim() &&
    Number(process.env.AI_DAILY_TOKEN_BUDGET) > 0,
  aiProvider: process.env.AI_PROVIDER_NAME?.trim() || null,
});
