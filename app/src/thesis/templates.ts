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
  {
    id: "kpm-slide",
    degrees: ["Bachelor", "Master"],
    discipline: "KPM · user-provided slide",
    kind: "KPM slide reference (unverified)",
  },
] as const;
export function templateBlueprint(
  templateId: string,
  language: string,
  degree: string,
) {
  if (!templates.some((t) => t.id === templateId))
    throw Error("UNKNOWN_TEMPLATE");
  // Based solely on a KPM teaching slide supplied by the user; NOT an
  // independently verified institutional requirement or official template.
  if (templateId === "kpm-slide") {
    const labels =
      language === "cs"
        ? [
            "Úvod",
            "Literární rešerše / Teoretická východiska",
            "Použité metody / Výzkumný postup",
            "Analýza a interpretace výsledků / Vyhodnocení stavu",
            "Návrh / Metodika / Plán implementace",
            "Diskuze (nepovinné; zejména pro DP)",
            "Závěr",
          ]
        : language.startsWith("zh")
          ? [
              "引言",
              "文献综述／理论基础",
              "研究方法／研究过程",
              "结果分析与解释／现状评估",
              "方案／方法设计／实施计划",
              "讨论（可选，尤其适用于硕士论文）",
              "结论",
            ]
          : [
              "Introduction",
              "Literature review / Theoretical background",
              "Methods / Research approach",
              "Results analysis / Current state evaluation",
              "Proposal / Methodology / Implementation plan",
              "Discussion (optional; especially for Master's)",
              "Conclusion",
            ];
    const kinds = [
      "introduction",
      "literature",
      "methodology",
      "results",
      "custom",
      "discussion",
      "conclusion",
    ] as const;
    const multiplier = degree === "PhD" ? 3 : degree === "Master" ? 2 : 1;
    return kinds.map((kind, i) => ({
      key: "kpm-" + kind,
      title: labels[i],
      kind,
      requirements:
        i === 5 ? "Optional section according to the supplied KPM slide" : "",
      targetWords: (i === 6 ? 500 : i === 5 ? 800 : 1500) * multiplier,
      // Conclusion does not require the optional discussion chapter.
      dependencies: i === 0 ? [] : ["kpm-" + kinds[i === 6 ? 4 : i - 1]],
    }));
  }
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
