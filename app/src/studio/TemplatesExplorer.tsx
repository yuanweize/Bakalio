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
        }
      : locale === "zh"
        ? {
            title: "找到适合你的论文结构",
            degree: "学位",
            kind: "研究形式",
            language: "论文语言",
            note: "通用模板，未经任何学校官方认证。",
          }
        : {
            title: "Find a structure for your thesis",
            degree: "Degree",
            kind: "Research type",
            language: "Thesis language",
            note: "Generic templates. Not official requirements for any university.",
          };
  const names =
    locale === "cs"
      ? [
          "Empirický výzkum",
          "Přehled literatury",
          "Experiment / inženýrství",
          "Software / design science",
        ]
      : locale === "zh"
        ? ["实证研究", "文献综述", "实验与工程", "软件与设计科学"]
        : templates.map((t) => t.kind);
  return (
    <section className="templates-explorer" id="templates">
      <div>
        <span className="small-label">Bakalio / Templates</span>
        <h2>{c.title}</h2>
        <p>{c.note}</p>
        <div className="template-filters">
          <label>
            {c.degree}
            <select
              aria-label={c.degree}
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
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
                <option key={t.id} value={t.id}>
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
