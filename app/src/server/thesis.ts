import { HttpError, prisma } from "wasp/server";
import { z } from "zod";
import { requireProject } from "./operations";
import {
  extractRequirements,
  requirementSchema,
  blueprintSchema,
  genericBlueprint,
  assertTransition,
} from "../thesis/workflow";

export async function thesisAction(input: Record<string, any>, uid: string) {
  const projectId = z.string().uuid().parse(input.projectId);
  await requireProject(projectId, uid);
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
  });
  if (input.kind === "thesis.proposal") {
    const text = z.string().trim().min(10).max(100000).parse(input.text);
    return prisma.$transaction(async (tx) => {
      const existing = await tx.proposal.findUnique({ where: { projectId } });
      if (existing) {
        const updated = await tx.proposal.updateMany({
          where: {
            projectId,
            version: z.number().int().positive().parse(input.version),
          },
          data: {
            text,
            requirements: extractRequirements(text),
            confirmedAt: null,
            version: { increment: 1 },
          },
        });
        if (!updated.count) throw new HttpError(409, "CONFLICT");
        return tx.proposal.findUniqueOrThrow({ where: { projectId } });
      }
      return tx.proposal.create({
        data: { projectId, text, requirements: extractRequirements(text) },
      });
    });
  }
  if (input.kind === "thesis.confirm") {
    const requirements = z
      .array(requirementSchema)
      .length(8)
      .parse(input.requirements);
    if (new Set(requirements.map((r) => r.key)).size !== 8)
      throw new HttpError(400, "INVALID");
    return prisma.$transaction(
      async (tx) => {
        const proposal = await tx.proposal.findUniqueOrThrow({
          where: { projectId },
        });
        for (const field of requirements) {
          if (
            field.origin === "explicit" &&
            (field.offset < 0 ||
              proposal.text.slice(
                field.offset,
                field.offset + field.quote.length,
              ) !== field.quote ||
              !field.quote.includes(field.value))
          )
            throw new HttpError(400, "INVALID_PROVENANCE");
        }
        const updated = await tx.proposal.updateMany({
          where: {
            projectId,
            version: z.number().int().positive().parse(input.version),
          },
          data: {
            requirements,
            confirmedAt: new Date(),
            version: { increment: 1 },
          },
        });
        if (!updated.count) throw new HttpError(409, "CONFLICT");
        const last = await tx.blueprint.findFirst({
          where: { projectId },
          orderBy: { version: "desc" },
        });
        return tx.blueprint.create({
          data: {
            projectId,
            version: (last?.version || 0) + 1,
            proposalVersion: proposal.version + 1,
            structure: genericBlueprint(project.language),
          },
        });
      },
      { isolationLevel: "Serializable" },
    );
  }
  if (input.kind === "thesis.blueprint") {
    const structure = blueprintSchema.parse(input.structure);
    return prisma.$transaction(
      async (tx) => {
        const last = await tx.blueprint.findFirst({
          where: { projectId },
          orderBy: { version: "desc" },
        });
        const proposal = await tx.proposal.findUnique({ where: { projectId } });
        if (!last || last.version !== input.version)
          throw new HttpError(409, "CONFLICT");
        if (!proposal?.confirmedAt || proposal.version !== last.proposalVersion)
          throw new HttpError(409, "PROPOSAL_CHANGED");
        const blueprint = await tx.blueprint.create({
          data: {
            projectId,
            version: last.version + 1,
            proposalVersion: last.proposalVersion,
            structure,
            approvedAt: new Date(),
          },
        });
        for (const [position, block] of structure.entries()) {
          const existing = await tx.thesisSection.findUnique({
            where: {
              projectId_blueprintKey: { projectId, blueprintKey: block.key },
            },
          });
          if (existing) {
            await tx.thesisSection.update({
              where: { id: existing.id },
              data: {
                title: block.title,
                position,
                requirements: block.requirements,
                targetWords: block.targetWords,
                dependencies: block.dependencies,
                version: { increment: 1 },
              },
            });
          } else {
            await tx.thesisSection.create({
              data: {
                project: { connect: { id: projectId } },
                blueprintKey: block.key,
                title: block.title,
                kind: block.kind,
                position,
                requirements: block.requirements,
                targetWords: block.targetWords,
                dependencies: block.dependencies,
                document: {
                  create: {
                    projectId,
                    title: block.title,
                    content: { type: "doc", content: [{ type: "paragraph" }] },
                  },
                },
              },
            });
          }
        }
        // Removed blocks retain their documents and section records. No writing is deleted.
        return blueprint;
      },
      { isolationLevel: "Serializable" },
    );
  }
  if (input.kind === "thesis.status") {
    const section = await prisma.thesisSection.findFirst({
      where: { id: z.string().uuid().parse(input.id), projectId },
    });
    if (!section) throw new HttpError(404, "NOT_FOUND");
    try {
      assertTransition(section.status, input.status);
    } catch {
      throw new HttpError(400, "INVALID_TRANSITION");
    }
    const updated = await prisma.thesisSection.updateMany({
      where: {
        id: section.id,
        version: z.number().int().positive().parse(input.version),
      },
      data: { status: input.status, version: { increment: 1 } },
    });
    if (!updated.count) throw new HttpError(409, "CONFLICT");
    return { ok: true };
  }
  throw new HttpError(400, "INVALID");
}
