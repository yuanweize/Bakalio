import { useState } from "react";
import { Link } from "react-router";
import { useI18n } from "./i18n";
import { genericBlueprint } from "../thesis/workflow";
const copy = {
  en: {
    tabs: ["Proposal", "Blueprint", "Section", "Evidence"],
    label: "Interactive demo · precomputed examples, no model calls",
    proposal:
      "How do campus study spaces support students? Plan a qualitative interview study. No interviews have taken place.",
    next: "Build example blueprint",
    select: "Choose a section",
    generate: "Load example draft",
    draft:
      "This proposed study explores how students use campus study spaces. Interviews have not yet been conducted. [NEEDS INPUT: participant recruitment and interview findings]",
    comment: "Revision comment",
    hint: "Try: make the missing-data limitation clearer.",
    revise: "Preview example revision",
    revision:
      "This study is a proposal. No participants have been recruited and no interview findings are available. [NEEDS INPUT: approved recruitment plan and actual findings]",
    accept: "Accept example",
    reject: "Reject",
    source: "Fictional teaching source",
    quote: "“No interviews have taken place.”",
    scope:
      "Example original passage, page 1. This locates text; it does not establish academic support.",
    open: "Open passage",
    reset: "Reset demo",
    full: "Open writing demo",
    note: "Your edits stay in this tab. Blueprint and revision outputs are prepared examples; they do not analyse your input.",
  },
  cs: {
    tabs: ["Zadání", "Osnova", "Kapitola", "Důkazy"],
    label: "Interaktivní ukázka · připravené příklady, bez volání AI",
    proposal:
      "Jak studijní prostory pomáhají studentům? Navrhni kvalitativní rozhovory. Rozhovory zatím neproběhly.",
    next: "Sestavit ukázkovou osnovu",
    select: "Vyber kapitolu",
    generate: "Načíst ukázkový koncept",
    draft:
      "Navrhovaný výzkum zkoumá využití studijních prostor. Rozhovory zatím neproběhly. [DOPLNIT: nábor účastníků a skutečná zjištění]",
    comment: "Komentář k úpravě",
    hint: "Zkus: zdůrazni, že data ještě nemáme.",
    revise: "Zobrazit ukázkovou úpravu",
    revision:
      "Jde o návrh výzkumu. Účastníci zatím nebyli osloveni a výsledky rozhovorů nejsou k dispozici. [DOPLNIT: schválený nábor a skutečná zjištění]",
    accept: "Přijmout příklad",
    reject: "Odmítnout",
    source: "Smyšlený výukový zdroj",
    quote: "„Rozhovory zatím neproběhly.“",
    scope:
      "Ukázkový úryvek, strana 1. Jde o nalezení textu, nikoli potvrzení podpory tvrzení.",
    open: "Otevřít úryvek",
    reset: "Obnovit ukázku",
    full: "Otevřít ukázku psaní",
    note: "Úpravy zůstávají v této kartě. Osnova i revize jsou připravené příklady, ne analýza tvého vstupu.",
  },
  zh: {
    tabs: ["任务书", "蓝图", "章节", "证据"],
    label: "交互演示 · 预先编写的示例，不调用模型",
    proposal: "校园学习空间如何支持学生？计划开展定性访谈。目前尚未进行访谈。",
    next: "建立示例蓝图",
    select: "选择章节",
    generate: "载入示例初稿",
    draft:
      "本研究计划探索学生如何使用校园学习空间。目前尚未进行访谈。[待补充：参与者招募与实际访谈结果]",
    comment: "修改批注",
    hint: "例如：更清楚地说明尚无数据。",
    revise: "预览示例修订",
    revision:
      "目前仅为研究计划，尚未招募参与者，也没有访谈结果。[待补充：获批的招募方案与实际研究发现]",
    accept: "接受示例",
    reject: "拒绝",
    source: "虚构教学来源",
    quote: "“目前尚未进行访谈。”",
    scope: "示例原文，第 1 页。只表示定位到文字，不代表学术论述获得支持。",
    open: "展开原文",
    reset: "重置演示",
    full: "进入写作演示",
    note: "修改仅保留在当前标签页。蓝图和修订为预先编写的示例，不会分析你输入的内容。",
  },
};
export function ThesisDemo() {
  const { locale } = useI18n();
  return <Demo key={locale} locale={locale} />;
}
function Demo({ locale }: { locale: keyof typeof copy }) {
  const c = copy[locale],
    blocks = genericBlueprint(locale);
  const [step, setStep] = useState(0),
    [proposal, setProposal] = useState(c.proposal),
    [section, setSection] = useState<string>(blocks[0].key),
    [draft, setDraft] = useState(""),
    [comment, setComment] = useState(""),
    [suggestion, setSuggestion] = useState(false),
    [evidence, setEvidence] = useState(false);
  return (
    <div className="journey thesis-demo">
      <div className="journey-bar">
        <strong className="journey-mark">b.</strong>
        <span>{c.label}</span>
      </div>
      <div className="journey-tabs" role="tablist" aria-label={c.label}>
        {c.tabs.map((t, i) => (
          <button
            key={t}
            role="tab"
            id={`thesis-tab-${i}`}
            aria-controls="thesis-demo-panel"
            aria-selected={i === step}
            tabIndex={i === step ? 0 : -1}
            onClick={() => setStep(i)}
            onKeyDown={(e) => {
              if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                const next =
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? 3
                      : (i + (e.key === "ArrowRight" ? 1 : 3)) % 4;
                setStep(next);
                document.getElementById(`thesis-tab-${next}`)?.focus();
              }
            }}
          >
            <span>{i + 1}</span>
            {t}
          </button>
        ))}
      </div>
      <div
        className="journey-panel"
        id="thesis-demo-panel"
        role="tabpanel"
        aria-labelledby={`thesis-tab-${step}`}
      >
        {step === 0 ? (
          <>
            <h3>{c.tabs[0]}</h3>
            <textarea
              aria-label={c.tabs[0]}
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              maxLength={4000}
            />
            <button className="btn primary" onClick={() => setStep(1)}>
              {c.next}
            </button>
          </>
        ) : step === 1 ? (
          <>
            <h3>{c.tabs[1]}</h3>
            <ol className="journey-outline">
              {blocks.map((b) => (
                <li key={b.key}>
                  <button
                    onClick={() => {
                      setSection(b.key);
                      setStep(2);
                    }}
                  >
                    {b.title} <span>↗</span>
                  </button>
                </li>
              ))}
            </ol>
          </>
        ) : step === 2 ? (
          <>
            <select
              aria-label={c.select}
              value={section}
              onChange={(e) => setSection(e.target.value)}
            >
              {blocks.map((b) => (
                <option value={b.key} key={b.key}>
                  {b.title}
                </option>
              ))}
            </select>
            <button className="btn secondary" onClick={() => setDraft(c.draft)}>
              {c.generate}
            </button>
            <textarea
              aria-label={c.tabs[2]}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <label>
              {c.comment}
              <input
                value={comment}
                placeholder={c.hint}
                onChange={(e) => setComment(e.target.value)}
              />
            </label>
            <button
              disabled={!comment.trim() || !draft}
              onClick={() => setSuggestion(true)}
            >
              {c.revise}
            </button>
            {suggestion && (
              <div className="demo-diff">
                <del>{draft}</del>
                <ins>{c.revision}</ins>
                <button
                  onClick={() => {
                    setDraft(c.revision);
                    setSuggestion(false);
                  }}
                >
                  {c.accept}
                </button>
                <button onClick={() => setSuggestion(false)}>{c.reject}</button>
              </div>
            )}
          </>
        ) : (
          <>
            <span className="badge">L0 · Demo</span>
            <h3>{c.source}</h3>
            <button
              className="btn secondary"
              aria-expanded={evidence}
              onClick={() => setEvidence(!evidence)}
            >
              {c.open}
            </button>
            {evidence && (
              <blockquote className="journey-evidence">{c.quote}</blockquote>
            )}
            <p>{c.scope}</p>
          </>
        )}
      </div>
      <div className="journey-footer">
        <p>{c.note}</p>
        <button
          onClick={() => {
            setStep(0);
            setProposal(c.proposal);
            setDraft("");
            setComment("");
            setSuggestion(false);
            setEvidence(false);
          }}
        >
          {c.reset}
        </button>
        <Link to="/demo">{c.full} ↗</Link>
      </div>
    </div>
  );
}
