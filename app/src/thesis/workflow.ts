import { z } from "zod";

export const requirementKeys = [
  "title",
  "question",
  "objectives",
  "method",
  "language",
  "deadline",
  "supervisor",
  "data",
] as const;
export const requirementSchema = z.object({
  key: z.enum(requirementKeys),
  value: z.string().max(4000),
  quote: z.string().max(4000),
  offset: z.number().int().min(-1),
  origin: z.enum(["explicit", "missing", "user"]),
});
export type Requirement = z.infer<typeof requirementSchema>;
const labels: Record<(typeof requirementKeys)[number], RegExp> = {
  title: /^(?:title|název|标题)\s*[:：]\s*(.+)$/im,
  question: /^(?:research question|výzkumná otázka|研究问题)\s*[:：]\s*(.+)$/im,
  objectives: /^(?:objectives?|cíle?|目标)\s*[:：]\s*(.+)$/im,
  method: /^(?:methods?|metod[ay]|研究方法)\s*[:：]\s*(.+)$/im,
  language: /^(?:language|jazyk|语言)\s*[:：]\s*(.+)$/im,
  deadline: /^(?:deadline|termín|截止时间)\s*[:：]\s*(.+)$/im,
  supervisor: /^(?:supervisor|vedoucí|导师)\s*[:：]\s*(.+)$/im,
  data: /^(?:data|数据)\s*[:：]\s*(.+)$/im,
};
// Deterministic extraction only. Missing fields are never inferred as facts.
export function extractRequirements(text: string): Requirement[] {
  return requirementKeys.map((key) => {
    const match = labels[key].exec(text);
    return {
      key,
      value: match?.[1]?.trim() || "",
      quote: match?.[0] || "",
      offset: match?.index ?? -1,
      origin: match ? "explicit" : "missing",
    };
  });
}
export const blockSchema = z.object({
  key: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),
  title: z.string().trim().min(1).max(300),
  kind: z.enum([
    "introduction",
    "literature",
    "methodology",
    "results",
    "discussion",
    "conclusion",
    "custom",
  ]),
  requirements: z.string().max(4000),
  targetWords: z.number().int().min(0).max(100000),
  dependencies: z.array(z.string()).max(100),
});
export const blueprintSchema = z
  .array(blockSchema)
  .min(1)
  .max(100)
  .superRefine((blocks, ctx) => {
    const seen = new Set<string>();
    for (const block of blocks) {
      if (seen.has(block.key) || block.dependencies.some((k) => !seen.has(k)))
        ctx.addIssue({
          code: "custom",
          message: "Duplicate key or dependency must precede its section",
        });
      seen.add(block.key);
    }
  });
export function genericBlueprint(
  language: string,
): z.infer<typeof blockSchema>[] {
  const titles =
    language === "cs"
      ? [
          "Úvod",
          "Přehled literatury",
          "Metodologie",
          "Výsledky",
          "Diskuse",
          "Závěr",
        ]
      : language.startsWith("zh")
        ? ["绪论", "文献综述", "研究方法", "研究结果", "讨论", "结论"]
        : [
            "Introduction",
            "Literature review",
            "Methodology",
            "Results",
            "Discussion",
            "Conclusion",
          ];
  const kinds = [
    "introduction",
    "literature",
    "methodology",
    "results",
    "discussion",
    "conclusion",
  ] as const;
  return kinds.map((kind, i) => ({
    key: kind,
    title: titles[i],
    kind,
    requirements: "",
    targetWords: i === 5 ? 500 : 1500,
    dependencies: i ? [kinds[i - 1]] : [],
  }));
}
export const transitions: Record<string, readonly string[]> = {
  not_started: ["ready", "blocked"],
  ready: ["draft", "blocked", "needs_human_input"],
  generating: ["draft", "failed", "needs_human_input"],
  draft: ["needs_review", "revision_requested"],
  needs_review: ["revision_requested", "evidence_review"],
  revision_requested: ["draft", "needs_human_input"],
  evidence_review: ["approved", "revision_requested"],
  approved: ["revision_requested"],
  blocked: ["ready"],
  failed: ["ready"],
  needs_human_input: ["ready", "draft"],
};
export function assertTransition(from: string, to: string) {
  if (!transitions[from]?.includes(to)) throw new Error("INVALID_TRANSITION");
}
