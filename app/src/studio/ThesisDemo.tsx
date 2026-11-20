import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BookOpenText,
  Check,
  ChevronRight,
  CircleHelp,
  FileCheck2,
  FilePenLine,
  FileText,
  Layers3,
  MessageSquareText,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useI18n } from "./i18n";
import { genericBlueprint } from "../thesis/workflow";

const copy = {
  en: {
    tabs: ["Proposal", "Blueprint", "Section", "Evidence"],
    label: "Product walkthrough · prepared examples, no AI calls",
    workspace: "Example thesis workspace",
    project: "Campus spaces & student belonging",
    degree: "Bachelor thesis · Qualitative study",
    outline: "Thesis chapters",
    badge: "INTERACTIVE PREVIEW",
    workspaceLabel: "Writing environment",
    step: "STEP",
    proposal:
      "How do campus study spaces support students? Plan a qualitative interview study. No interviews have taken place.",
    next: "Build example blueprint",
    upload: "Start from an assignment",
    paper: "Proposal / Assignment",
    format: "You can change this example text",
    docNote:
      "The blueprint below is a fixed example; editing this text does not trigger AI.",
    goal: "Research focus",
    goalValue: "Campus learning spaces",
    method: "Suggested approach",
    methodValue: "Qualitative interviews",
    gap: "Open research requirement",
    gapValue: "No interviews conducted yet",
    buildTitle: "Your thesis, broken into manageable steps.",
    buildSubtitle:
      "Explore a sample chapter map, then open a block to see how writing and review fit together.",
    select: "Choose a section",
    planned: "Planned",
    drafting: "Draft in progress",
    intro: "Six linked chapters",
    chapterInfo: "Each block has its own draft and review status.",
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
    editor: "Chapter editor",
    autosaved: "Stored in this browser tab only",
    compare: "Review proposed change",
    source: "Fictional teaching source",
    quote: "“No interviews have taken place.”",
    scope:
      "This sample merely locates a passage; it does not establish academic support.",
    open: "Open passage",
    reset: "Reset demo",
    full: "Explore the full writing demo",
    rightHeading: "Research assistant",
    rightSubtitle: "Context for the current step",
    rightProposal:
      "Check your assignment before planning. Missing data stays missing.",
    rightBlueprint:
      "Your outline is a set of connected, independently editable chapters.",
    rightDraft:
      "Add a comment and inspect the suggested change before accepting it.",
    rightEvidence:
      "A real claim needs a traceable passage and a separate verification result.",
    verification: "Evidence integrity",
    unverified: "L0 · Unverified",
    sourceType: "Teaching-only source",
    noAi: "No model run · no invented research",
    caution: "This is a guided simulation, not a generated or verified thesis.",
    action: "Try a chapter",
    note: "Example blueprint and revisions are prepared in advance. They do not analyse your input. Nothing is sent to an AI service.",
  },
  cs: {
    tabs: ["Zadání", "Osnova", "Kapitola", "Důkazy"],
    label: "Ukázka produktu · připravené příklady, bez volání AI",
    workspace: "Ukázkový prostor pro práci",
    project: "Studijní prostory a pocit sounáležitosti",
    degree: "Bakalářská práce · kvalitativní výzkum",
    outline: "Kapitoly práce",
    badge: "INTERAKTIVNÍ UKÁZKA",
    workspaceLabel: "Prostředí pro psaní",
    step: "KROK",
    proposal:
      "Jak studijní prostory pomáhají studentům? Navrhni kvalitativní rozhovory. Rozhovory zatím neproběhly.",
    next: "Sestavit ukázkovou osnovu",
    upload: "Začni zadáním",
    paper: "Zadání závěrečné práce",
    format: "Text můžeš upravit",
    docNote: "Osnova je připravený příklad; změny textu nespouštějí AI.",
    goal: "Téma výzkumu",
    goalValue: "Studijní prostory",
    method: "Navržený postup",
    methodValue: "Kvalitativní rozhovory",
    gap: "Co chybí",
    gapValue: "Rozhovory zatím neproběhly",
    buildTitle: "Práce rozdělená do zvládnutelných kroků.",
    buildSubtitle:
      "Prohlédni si ukázkovou osnovu a otevři kapitolu. Každá má vlastní text a kontrolu.",
    select: "Vyber kapitolu",
    planned: "Naplánováno",
    drafting: "Rozpracováno",
    intro: "Šest navazujících kapitol",
    chapterInfo: "Každá část má vlastní koncept a stav kontroly.",
    generate: "Načíst ukázkový koncept",
    draft:
      "Navrhovaný výzkum zkoumá využití studijních prostor. Rozhovory zatím neproběhly. [DOPLNIT: nábor účastníků a skutečná zjištění]",
    comment: "Komentář k úpravě",
    hint: "Zkus: zdůrazni, že zatím nemáme data.",
    revise: "Zobrazit ukázkovou úpravu",
    revision:
      "Jde o návrh výzkumu. Účastníci zatím nebyli osloveni a výsledky rozhovorů nejsou k dispozici. [DOPLNIT: schválený nábor a skutečná zjištění]",
    accept: "Přijmout příklad",
    reject: "Odmítnout",
    editor: "Editor kapitoly",
    autosaved: "Uloženo jen v této kartě prohlížeče",
    compare: "Porovnat navržené změny",
    source: "Smyšlený výukový zdroj",
    quote: "„Rozhovory zatím neproběhly.“",
    scope: "Ukázka pouze lokalizuje úryvek; nepotvrzuje vědecké tvrzení.",
    open: "Otevřít úryvek",
    reset: "Obnovit ukázku",
    full: "Otevřít ukázku psaní",
    rightHeading: "Asistent výzkumu",
    rightSubtitle: "Kontext aktuálního kroku",
    rightProposal:
      "Před plánováním zkontroluj zadání. Chybějící data zůstanou označená.",
    rightBlueprint:
      "Osnova se skládá z navazujících kapitol, které lze upravovat samostatně.",
    rightDraft: "Přidej komentář a před přijetím zkontroluj navrženou úpravu.",
    rightEvidence:
      "Tvrzení potřebuje dohledatelný úryvek a samostatné ověření.",
    verification: "Důvěryhodnost důkazů",
    unverified: "L0 · Neověřeno",
    sourceType: "Jen výukový zdroj",
    noAi: "Bez modelu · bez smyšlených zjištění",
    caution: "Jde o řízenou ukázku, nikoli o vygenerovanou či ověřenou práci.",
    action: "Vyzkoušet kapitolu",
    note: "Osnova i úpravy jsou předem připravené. Neanalyzují tvůj text a nic se neposílá AI.",
  },
  zh: {
    tabs: ["任务书", "论文蓝图", "章节写作", "证据核验"],
    label: "产品交互演示 · 预设示例，不调用 AI",
    workspace: "示例论文工作台",
    project: "校园空间与学生归属感",
    degree: "本科论文 · 定性研究",
    outline: "论文章节",
    badge: "交互式产品预览",
    workspaceLabel: "论文创作空间",
    step: "步骤",
    proposal: "校园学习空间如何支持学生？计划开展定性访谈。目前尚未进行访谈。",
    next: "建立示例蓝图",
    upload: "从任务书开始",
    paper: "Proposal / 论文任务书",
    format: "可以修改这份示例文本",
    docNote: "蓝图为预设示例，修改任务书不会触发 AI 分析。",
    goal: "研究主题",
    goalValue: "校园学习空间",
    method: "建议研究方法",
    methodValue: "定性访谈",
    gap: "尚待补充",
    gapValue: "尚未开展访谈",
    buildTitle: "让整篇论文变成可完成的小任务。",
    buildSubtitle:
      "浏览示例论文结构，点击任一章节，体验从草稿到审阅的完整流程。",
    select: "选择章节",
    planned: "已规划",
    drafting: "正在写作",
    intro: "六个相互关联的章节",
    chapterInfo: "每个积木都有独立草稿和审核状态。",
    generate: "载入示例初稿",
    draft:
      "本研究计划探索学生如何使用校园学习空间。目前尚未进行访谈。[待补充：参与者招募与实际访谈结果]",
    comment: "修改批注",
    hint: "例如：更清楚地说明目前尚无数据。",
    revise: "预览示例修订",
    revision:
      "目前仅为研究计划，尚未招募参与者，也没有访谈结果。[待补充：获批的招募方案与实际研究发现]",
    accept: "接受示例",
    reject: "拒绝",
    editor: "章节编辑器",
    autosaved: "仅保存在当前浏览器标签页",
    compare: "审阅建议修改",
    source: "虚构教学来源",
    quote: "“目前尚未进行访谈。”",
    scope: "仅演示定位原文，并不代表论文论断已被学术证据支持。",
    open: "展开原文",
    reset: "重置演示",
    full: "进入完整写作演示",
    rightHeading: "研究助手",
    rightSubtitle: "与当前步骤相关的建议",
    rightProposal: "先确认研究任务；没有提供的数据保持待确认，不会被编造。",
    rightBlueprint: "章节彼此关联，但可以单独编辑、生成和审阅。",
    rightDraft: "通过批注提出修改要求，审阅差异之后再接受。",
    rightEvidence: "每条学术论断都需要可定位的原文和独立核验结果。",
    verification: "证据可信度",
    unverified: "L0 · 未核验",
    sourceType: "仅供教学演示",
    noAi: "未调用模型 · 不编造研究发现",
    caution: "这是功能引导演示，不是真正生成或核验后的论文。",
    action: "体验章节",
    note: "论文蓝图和修订文字均为预写示例，不分析输入，也不会把内容传给 AI。",
  },
} as const;

export function ThesisDemo() {
  const { locale } = useI18n();
  return <Demo key={locale} locale={locale} />;
}

function Demo({ locale }: { locale: keyof typeof copy }) {
  const c = copy[locale];
  const blocks = genericBlueprint(locale);
  const [step, setStep] = useState(0);
  const [proposal, setProposal] = useState<string>(c.proposal);
  const [built, setBuilt] = useState(false);
  const [section, setSection] = useState(blocks[0].key);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [comment, setComment] = useState("");
  const [suggestion, setSuggestion] = useState(false);
  const [evidence, setEvidence] = useState(false);
  const draft = drafts[section] || "";
  const current = blocks.find((b) => b.key === section) || blocks[0];
  const count = Object.values(drafts).filter((v) => v.trim()).length;

  function selectSection(key: string) {
    setSection(key);
    setSuggestion(false);
    setComment("");
    setStep(2);
  }
  function updateDraft(next: string) {
    setDrafts((previous) => ({ ...previous, [section]: next }));
  }
  function reset() {
    setStep(0);
    setProposal(c.proposal);
    setBuilt(false);
    setSection(blocks[0].key);
    setDrafts({});
    setComment("");
    setSuggestion(false);
    setEvidence(false);
  }

  return (
    <div className="journey thesis-demo" aria-label={c.workspace}>
      <header className="journey-bar thesis-demo-top">
        <span className="thesis-demo-brand" aria-hidden="true">
          b.
        </span>
        <span className="thesis-demo-top-title">{c.workspace}</span>
        <span className="thesis-demo-top-meta">
          <span className="thesis-demo-live-dot" />
          {c.label}
        </span>
      </header>
      <div className="thesis-demo-body">
        <aside className="thesis-demo-rail" aria-label={c.outline}>
          <div className="thesis-demo-project">
            <span className="thesis-demo-book">
              <BookOpenText size={19} />
            </span>
            <div>
              <strong>{c.project}</strong>
              <small>{c.degree}</small>
            </div>
          </div>
          <div className="thesis-demo-rail-heading">
            <span>{c.outline}</span>
            <span>
              {count}/{blocks.length}
            </span>
          </div>
          <div className="thesis-demo-progress" aria-hidden="true">
            <span style={{ width: (count / blocks.length) * 100 + "%" }} />
          </div>
          <ol className="thesis-demo-outline journey-outline">
            {blocks.map((b, i) => (
              <li key={b.key}>
                <button
                  onClick={() => selectSection(b.key)}
                  aria-current={
                    section === b.key && step === 2 ? "step" : undefined
                  }
                >
                  <span className="thesis-demo-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="thesis-demo-chapter-name">{b.title}</span>
                  {drafts[b.key]?.trim() ? (
                    <Check size={13} />
                  ) : (
                    <ChevronRight size={13} />
                  )}
                </button>
              </li>
            ))}
          </ol>
          <div className="thesis-demo-rail-foot">
            <ShieldCheck size={15} />
            {c.noAi}
          </div>
        </aside>
        <div className="thesis-demo-workarea">
          <div
            className="thesis-demo-stepbar journey-tabs"
            role="tablist"
            aria-label={c.label}
          >
            {c.tabs.map((title, i) => (
              <button
                type="button"
                key={title}
                id={"thesis-tab-" + i}
                aria-controls="thesis-demo-panel"
                role="tab"
                aria-selected={i === step}
                tabIndex={i === step ? 0 : -1}
                onClick={() => setStep(i)}
                onKeyDown={(event) => {
                  if (
                    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                      event.key,
                    )
                  ) {
                    event.preventDefault();
                    const next =
                      event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? 3
                          : (i + (event.key === "ArrowRight" ? 1 : 3)) % 4;
                    setStep(next);
                    document.getElementById("thesis-tab-" + next)?.focus();
                  }
                }}
              >
                <span>{i + 1}</span>
                {title}
              </button>
            ))}
          </div>
          <div className="thesis-demo-content">
            <main
              className="journey-panel thesis-demo-canvas"
              id="thesis-demo-panel"
              role="tabpanel"
              aria-labelledby={"thesis-tab-" + step}
            >
              <div className="thesis-demo-kicker">
                <span>
                  {c.step} {step + 1} / 4
                </span>
                <span className="thesis-demo-kicker-icon">
                  <Layers3 size={15} /> {c.workspaceLabel}
                </span>
              </div>
              {step === 0 && (
                <div className="thesis-demo-document">
                  <div className="thesis-demo-doc-head">
                    <FileText size={19} />
                    <span>{c.paper}</span>
                    <span className="thesis-demo-pill">TXT</span>
                  </div>
                  <h3>{c.upload}</h3>
                  <p className="thesis-demo-subtitle">{c.format}</p>
                  <textarea
                    aria-label={c.tabs[0]}
                    value={proposal}
                    maxLength={4000}
                    onChange={(e) => setProposal(e.target.value)}
                    rows={5}
                  />
                  <p className="thesis-demo-hint">{c.docNote}</p>
                  <button
                    className="btn primary thesis-demo-main-action"
                    onClick={() => {
                      setBuilt(true);
                      setStep(1);
                    }}
                    disabled={!proposal.trim()}
                  >
                    {c.next}
                    <ArrowRight size={17} />
                  </button>
                </div>
              )}
              {step === 1 && (
                <div className="thesis-demo-document">
                  <div className="thesis-demo-doc-head">
                    <Layers3 size={19} />
                    <span>{c.tabs[1]}</span>
                    <span className="thesis-demo-pill">6 {c.tabs[2]}</span>
                  </div>
                  <h3>{c.buildTitle}</h3>
                  <p className="thesis-demo-subtitle">{c.buildSubtitle}</p>
                  <ol className="thesis-demo-chapter-cards journey-outline">
                    {blocks.map((b, i) => (
                      <li key={b.key}>
                        <button
                          type="button"
                          onClick={() => selectSection(b.key)}
                        >
                          <span className="thesis-demo-number">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="thesis-demo-chapter-name">
                            <strong>{b.title}</strong>
                            <small>
                              {drafts[b.key] ? c.drafting : c.planned}
                            </small>
                          </span>
                          <span className="thesis-demo-word-target">
                            ~{b.targetWords.toLocaleString(locale)} w
                          </span>
                          <ArrowRight size={17} />
                        </button>
                      </li>
                    ))}
                  </ol>
                  <p className="thesis-demo-hint">
                    {built ? c.chapterInfo : c.note}
                  </p>
                </div>
              )}
              {step === 2 && (
                <div className="thesis-demo-document">
                  <div className="thesis-demo-doc-head">
                    <FilePenLine size={19} />
                    <span>{c.editor}</span>
                    <span className="thesis-demo-pill">
                      {draft ? c.drafting : c.planned}
                    </span>
                  </div>
                  <label className="thesis-demo-section-label">
                    {c.select}
                    <select
                      aria-label={c.select}
                      value={section}
                      onChange={(e) => selectSection(e.target.value)}
                    >
                      {blocks.map((b) => (
                        <option value={b.key} key={b.key}>
                          {b.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="thesis-demo-paper">
                    <h3>{current.title}</h3>
                    <div className="thesis-demo-rule" />
                    {draft ? (
                      <textarea
                        aria-label={c.tabs[2]}
                        value={draft}
                        onChange={(e) => updateDraft(e.target.value)}
                        rows={5}
                      />
                    ) : (
                      <div className="thesis-demo-empty">
                        <FileText size={22} />
                        <p>{c.chapterInfo}</p>
                        <button
                          className="btn secondary"
                          onClick={() => updateDraft(c.draft)}
                        >
                          {c.generate}
                          <Sparkles size={16} />
                        </button>
                      </div>
                    )}
                    {draft && (
                      <small className="thesis-demo-draft-state">
                        <Check size={13} />
                        {c.autosaved}
                      </small>
                    )}
                  </div>
                  {draft && (
                    <div className="thesis-demo-comment">
                      <label>
                        <MessageSquareText size={16} />
                        {c.comment}
                        <input
                          aria-label={c.comment}
                          value={comment}
                          placeholder={c.hint}
                          onChange={(e) => {
                            setComment(e.target.value);
                            setSuggestion(false);
                          }}
                        />
                      </label>
                      <button
                        className="btn secondary"
                        disabled={!comment.trim()}
                        onClick={() => setSuggestion(true)}
                      >
                        {c.revise}
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                  {suggestion && (
                    <div className="demo-diff">
                      <strong>{c.compare}</strong>
                      <del>{draft}</del>
                      <ins>{c.revision}</ins>
                      <div className="thesis-demo-diff-actions">
                        <button
                          className="btn primary"
                          onClick={() => {
                            updateDraft(c.revision);
                            setSuggestion(false);
                          }}
                        >
                          {c.accept}
                          <Check size={15} />
                        </button>
                        <button
                          className="btn secondary"
                          onClick={() => setSuggestion(false)}
                        >
                          {c.reject}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {step === 3 && (
                <div className="thesis-demo-document">
                  <div className="thesis-demo-doc-head">
                    <ShieldAlert size={19} />
                    <span>{c.verification}</span>
                    <span className="thesis-demo-pill">{c.unverified}</span>
                  </div>
                  <h3>{c.source}</h3>
                  <p className="thesis-demo-subtitle">{c.scope}</p>
                  <div className="thesis-demo-source">
                    <span className="thesis-demo-source-icon">
                      <BookOpenText size={23} />
                    </span>
                    <div>
                      <strong>{c.source}</strong>
                      <small>{c.sourceType} · p. 1</small>
                    </div>
                    <span className="thesis-demo-source-badge">L0</span>
                  </div>
                  <button
                    className="btn secondary"
                    aria-expanded={evidence}
                    onClick={() => setEvidence(!evidence)}
                  >
                    {c.open}
                    <ChevronRight size={15} />
                  </button>
                  {evidence && (
                    <blockquote className="journey-evidence">
                      {c.quote}
                      <span>p. 1 · {c.sourceType}</span>
                    </blockquote>
                  )}
                  <div className="thesis-demo-warning">
                    <ShieldAlert size={17} />
                    <p>{c.caution}</p>
                  </div>
                </div>
              )}
            </main>
            <aside className="thesis-demo-context">
              <div className="thesis-demo-context-heading">
                <span className="thesis-demo-assistant-icon">
                  <Sparkles size={17} />
                </span>
                <div>
                  <strong>{c.rightHeading}</strong>
                  <small>{c.rightSubtitle}</small>
                </div>
              </div>
              <div className="thesis-demo-context-note">
                <span>
                  {c.step} 0{step + 1}
                </span>
                <p>
                  {
                    [
                      c.rightProposal,
                      c.rightBlueprint,
                      c.rightDraft,
                      c.rightEvidence,
                    ][step]
                  }
                </p>
              </div>
              <div className="thesis-demo-context-metrics">
                <span>
                  <FileCheck2 size={16} />
                  {c.verification}
                </span>
                <strong>{c.unverified}</strong>
                <small>{c.scope}</small>
              </div>
              <button
                className="thesis-demo-context-next"
                onClick={() => setStep(step === 3 ? 0 : step + 1)}
              >
                {step === 3 ? c.tabs[0] : c.tabs[step + 1]}
                <ArrowRight size={16} />
              </button>
              <div className="thesis-demo-context-safety">
                <CircleHelp size={15} />
                {c.caution}
              </div>
            </aside>
          </div>
        </div>
      </div>
      <footer className="journey-footer thesis-demo-footer">
        <span>{c.note}</span>
        <div>
          <button type="button" onClick={reset}>
            <RotateCcw size={14} />
            {c.reset}
          </button>
          <Link to="/demo">
            {c.full}
            <ArrowRight size={15} />
          </Link>
        </div>
      </footer>
    </div>
  );
}
