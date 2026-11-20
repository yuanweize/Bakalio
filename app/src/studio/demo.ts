import type { RichNode } from "./content";
export const demoContent: RichNode = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Learning in the spaces between" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "How informal campus spaces shape a student’s sense of belonging.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "1. Introduction" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "A university is more than its lecture halls. The quiet corner of a library, a shared table, and the paths between buildings are also places where learning happens.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This teaching example explores how students describe these everyday spaces. It asks whether a sense of belonging emerges through repeated encounters, rather than through formal participation alone. ",
        },
        {
          type: "citation",
          attrs: {
            sourceId: "demo-source",
            citationId: "demo-citation",
            label: "Novák, 2025, p. 12",
          },
        },
      ],
    },
    {
      type: "blockquote",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "“I started to feel at home when there was a place I could return to between classes.”",
            },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "The quotation above is fictional teaching material. It is not a finding from an actual participant. A real study would need informed consent, a documented method and traceable evidence.",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "2. Research approach" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "The proposed approach combines semi-structured interviews with reflective mapping. The aim is to understand how students interpret their environment, without claiming that a small sample represents the whole university.",
        },
      ],
    },
  ],
};
export const demoSource = {
  id: "demo-source",
  title: "Everyday places, shared belonging",
  authors: "Jana Novák",
  year: "2025",
  doi: "",
  url: "",
  tags: ["Teaching example"],
  status: "manual",
  chunks: [
    {
      page: 12,
      text: "Fictional teaching material: a participant describes a familiar place between classes. This is not published research.",
    },
  ],
};

export type DemoLocale = "cs" | "en" | "zh";
const localized = {
  cs: {
    title: "Místa mezi přednáškami",
    subtitle:
      "Jak neformální prostory kampusu souvisejí s pocitem sounáležitosti.",
    intro: "1. Úvod",
    method: "2. Výzkumný přístup",
    paragraphs: [
      "Univerzita není jen soubor poslucháren. Tichý kout knihovny, společný stůl i cesta mezi budovami tvoří prostředí, ve kterém se studenti potkávají a učí.",
      "Tato výuková ukázka zkoumá, jak studenti popisují každodenní místa. Ptá se, zda pocit sounáležitosti vzniká také při opakovaných neformálních setkáních. ",
      "Výrok je smyšlený výukový materiál, nikoli výsledek skutečného rozhovoru. Reálný výzkum by vyžadoval souhlas účastníků, popis metody a dohledatelné podklady.",
      "Navržený postup spojuje polostrukturované rozhovory s mapováním míst. Cílem je porozumět zkušenostem studentů, nikoli zobecňovat malý vzorek na celou univerzitu.",
    ],
    quote:
      "„Začal jsem se cítit doma, když jsem měl mezi přednáškami místo, kam se vracet.“",
    source: "Každodenní místa a sounáležitost",
    evidence:
      "Smyšlený výukový podklad: účastník popisuje známé místo mezi přednáškami. Nejde o publikovaný výzkum.",
    label: "Novák, 2025, s. 12",
    tag: "Výuková ukázka",
  },
  zh: {
    title: "课间的那些空间",
    subtitle: "校园非正式空间与学生归属感之间的关系。",
    intro: "1. 引言",
    method: "2. 研究方法",
    paragraphs: [
      "大学不只有教室。图书馆安静的角落、共用的桌子、楼宇之间的小路，也是学生相遇和学习的地方。",
      "这份教学示例讨论学生如何描述这些日常空间，并提出一个问题：归属感是否也在反复的非正式相遇中形成？",
      "以上引语是虚构教学材料，不是真实访谈的发现。真实研究需要参与者同意、明确的方法和可追溯的证据。",
      "拟议方法结合半结构化访谈与空间记录。目标是理解学生的体验，而不是用少量样本代表整所大学。",
    ],
    quote: "“课间有一个可以回去的地方之后，我开始有了归属感。”",
    source: "日常空间与共同归属",
    evidence:
      "虚构教学材料：一名参与者描述课间熟悉的地点。这不是已发表的研究。",
    label: "Novák，2025，第 12 页",
    tag: "教学示例",
  },
};
export function demoFor(locale: DemoLocale) {
  if (locale === "en")
    return {
      title: "Learning in the spaces between",
      content: structuredClone(demoContent),
      source: structuredClone(demoSource),
    };
  const d = localized[locale];
  const content = structuredClone(demoContent);
  const nodes = content.content!;
  const set = (index: number, text: string) => {
    nodes[index].content![0].text = text;
  };
  set(0, d.title);
  set(1, d.subtitle);
  set(2, d.intro);
  set(3, d.paragraphs[0]);
  set(4, d.paragraphs[1]);
  nodes[4].content![1].attrs!.label = d.label;
  nodes[5].content![0].content![0].text = d.quote;
  set(6, d.paragraphs[2]);
  set(7, d.method);
  set(8, d.paragraphs[3]);
  return {
    title: d.title,
    content,
    source: {
      ...structuredClone(demoSource),
      title: d.source,
      tags: [d.tag],
      chunks: [{ page: 12, text: d.evidence }],
    },
  };
}
