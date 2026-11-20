import { genericBlueprint } from "./workflow";
export const templates = [
  {
    id: "empirical",
    degrees: ["Bachelor", "Master", "PhD"],
    discipline: "Social sciences",
    kind: "Empirical research",
  },
  {
    id: "literature",
    degrees: ["Bachelor", "Master", "PhD"],
    discipline: "Interdisciplinary",
    kind: "Literature review",
  },
  {
    id: "engineering",
    degrees: ["Bachelor", "Master", "PhD"],
    discipline: "Engineering",
    kind: "Experimental / engineering",
  },
  {
    id: "software",
    degrees: ["Bachelor", "Master", "PhD"],
    discipline: "Computer science",
    kind: "Software / design science",
  },
] as const;
export function templateBlueprint(
  templateId: string,
  language: string,
  degree: string,
) {
  if (!templates.some((t) => t.id === templateId))
    throw Error("UNKNOWN_TEMPLATE");
  const blocks = genericBlueprint(language);
  if (templateId === "literature") {
    blocks[3].title =
      language === "cs"
        ? "Syntéza literatury"
        : language.startsWith("zh")
          ? "文献综合分析"
          : "Literature synthesis";
    blocks[3].kind = "literature";
  }
  if (templateId === "software") {
    blocks[3].title =
      language === "cs"
        ? "Návrh a vyhodnocení"
        : language.startsWith("zh")
          ? "设计与评估"
          : "Design and evaluation";
    blocks[3].kind = "custom";
  }
  if (templateId === "engineering")
    blocks[2].title =
      language === "cs"
        ? "Experimentální návrh"
        : language.startsWith("zh")
          ? "实验设计"
          : "Experimental design";
  return blocks.map((b) => ({
    ...b,
    targetWords:
      degree === "PhD"
        ? b.targetWords * 3
        : degree === "Master"
          ? b.targetWords * 2
          : b.targetWords,
  }));
}
