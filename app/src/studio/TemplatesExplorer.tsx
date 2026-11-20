import { useState } from "react";
import { templates, templateBlueprint } from "../thesis/templates";
import { useI18n } from "./i18n";
export function TemplatesExplorer() {
  const { locale } = useI18n();
  const [degree, setDegree] = useState("Bachelor"),
    [kind, setKind] = useState("empirical"),
    [language, setLanguage] = useState(locale);
  const c =
    locale === "cs"
      ? {
          title: "Najdi strukturu své práce",
          degree: "Stupeň studia",
          kind: "Typ výzkumu",
          language: "Jazyk práce",
          note: "Obecné šablony. Nejde o oficiální požadavky konkrétní školy.",
          slide:
            "Tato sedmidílná osnova je přepsána z fotografie výukového snímku KPM zaslaného uživatelem. Původní předpis a jeho platnost nebyly nezávisle ověřeny.",
        }
      : locale === "zh"
        ? {
            title: "找到适合你的论文结构",
            degree: "学位",
            kind: "研究形式",
            language: "论文语言",
            note: "通用模板，未经任何学校官方认证。",
            slide:
              "本七章节结构仅依据用户提供的 KPM 教学幻灯片照片整理，尚未通过学校原始规定独立核验，不应视为官方模板。",
          }
        : {
            title: "Find a structure for your thesis",
            degree: "Degree",
            kind: "Research type",
            language: "Thesis language",
            note: "Generic templates. Not official requirements for any university.",
            slide:
              "This seven-chapter outline was transcribed from a user-provided KPM teaching-slide photo. The original policy and its current validity have not been independently verified.",
          };
  const names =
    locale === "cs"
      ? [
          "Empirický výzkum",
          "Přehled literatury",
          "Experiment / inženýrství",
          "Software / design science",
          "KPM: osnova ze snímku (neověřeno)",
        ]
      : locale === "zh"
        ? [
            "实证研究",
            "文献综述",
            "实验与工程",
            "软件与设计科学",
            "KPM 七章示例（未核验）",
          ]
        : templates.map((t) => t.kind);
  return (
    <section className="templates-explorer" id="templates">
      <div>
        <span className="small-label">Bakalio / Templates</span>
        <h2>{c.title}</h2>
        <p>{c.note}</p>
        {kind === "kpm-slide" && (
          <p className="template-provenance" role="note">
            {c.slide}
          </p>
        )}
        <div className="template-filters">
          <label>
            {c.degree}
            <select
              aria-label={c.degree}
              value={degree}
              onChange={(e) => {
                setDegree(e.target.value);
                if (e.target.value === "PhD" && kind === "kpm-slide")
                  setKind("empirical");
              }}
            >
              {["Bachelor", "Master", "PhD"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label>
            {c.kind}
            <select
              aria-label={c.kind}
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              {templates.map((t, i) => (
                <option
                  key={t.id}
                  value={t.id}
                  disabled={!t.degrees.some((d) => d === degree)}
                >
                  {names[i]}
                </option>
              ))}
            </select>
          </label>
          <label>
            {c.language}
            <select
              aria-label={c.language}
              value={language}
              onChange={(e) => setLanguage(e.target.value as typeof locale)}
            >
              <option value="cs">Čeština</option>
              <option value="en">English</option>
              <option value="zh">简体中文</option>
            </select>
          </label>
        </div>
      </div>
      <ol>
        {templateBlueprint(kind, language, degree).map((b) => (
          <li key={b.key}>
            <span>{b.title}</span>
            <small>
              ≈ {b.targetWords.toLocaleString(locale)}{" "}
              {locale === "cs" ? "slov" : locale === "zh" ? "字词" : "words"}
            </small>
          </li>
        ))}
      </ol>
    </section>
  );
}
