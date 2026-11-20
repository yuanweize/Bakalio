import { SectionAI } from "./SectionAI";
import { useState } from "react";
import { Link } from "react-router";
import { mutateStudio } from "wasp/client/operations";
import { useI18n } from "./i18n";
import { transitions, type Requirement } from "../thesis/workflow";
const copy = {
  en: {
    start: "Start with your proposal.",
    intro:
      "Paste your assignment. Explicitly labelled fields are located; missing details stay unconfirmed. No AI call is made.",
    input: "Proposal text",
    parse: "Locate requirements",
    review: "Review your requirements",
    confirm: "Confirm & build a generic blueprint",
    generic: "Generic structure · not AI-generated or university-approved",
    approve: "Save blueprint & create sections",
    title: "Section title",
    write: "Write",
    missing: "Not provided",
    user: "Edited by you",
    source: "Original text",
    save: "Saved",
    error:
      "Unable to save. Refresh to check the latest version before retrying.",
    section: "Sections",
    requirements: "Section requirements",
    words: "Target words",
  },
  cs: {
    start: "Začni zadáním práce.",
    intro:
      "Vlož zadání. Výslovně označené údaje dohledáme v textu. Chybějící informace zůstanou nepotvrzené. AI se nepoužívá.",
    input: "Text zadání",
    parse: "Najít požadavky",
    review: "Zkontroluj požadavky",
    confirm: "Potvrdit a sestavit obecnou osnovu",
    generic: "Obecná osnova · bez AI a bez schválení školou",
    approve: "Uložit osnovu a vytvořit kapitoly",
    title: "Název kapitoly",
    write: "Psát",
    missing: "Neuvedeno",
    user: "Tvoje úprava",
    source: "Původní text",
    save: "Uloženo",
    error: "Uložení se nezdařilo. Obnov stránku a zkontroluj aktuální verzi.",
    section: "Kapitoly",
    requirements: "Požadavky kapitoly",
    words: "Cílový počet slov",
  },
  zh: {
    start: "从论文任务书开始。",
    intro: "粘贴任务书，定位明确标注的字段。缺失信息保持待确认，不调用 AI。",
    input: "任务书原文",
    parse: "定位要求",
    review: "确认论文要求",
    confirm: "确认并建立通用蓝图",
    generic: "通用结构 · 非 AI 生成，未经学校认可",
    approve: "保存蓝图并创建章节",
    title: "章节标题",
    write: "开始写作",
    missing: "未提供",
    user: "你修改的内容",
    source: "原文",
    save: "已保存",
    error: "保存失败，请刷新检查最新版本后重试。",
    section: "章节",
    requirements: "章节要求",
    words: "目标字数",
  },
};
const statusLabels: Record<string, Record<string, string>> = {
  en: {},
  cs: {
    not_started: "Nezahájeno",
    ready: "Připraveno",
    draft: "Koncept",
    needs_review: "Ke kontrole",
    revision_requested: "K úpravě",
    evidence_review: "Kontrola důkazů",
    approved: "Schváleno",
    blocked: "Blokováno",
    failed: "Chyba",
    needs_human_input: "Doplň informace",
  },
  zh: {
    not_started: "尚未开始",
    ready: "准备就绪",
    draft: "草稿",
    needs_review: "待审阅",
    revision_requested: "需要修改",
    evidence_review: "证据审查",
    approved: "已批准",
    blocked: "受阻",
    failed: "失败",
    needs_human_input: "需要补充信息",
  },
};
const fields = {
  en: [
    "Title",
    "Research question",
    "Objectives",
    "Method",
    "Language",
    "Deadline",
    "Supervisor",
    "Existing data",
  ],
  cs: [
    "Název",
    "Výzkumná otázka",
    "Cíle",
    "Metoda",
    "Jazyk",
    "Termín",
    "Vedoucí",
    "Existující data",
  ],
  zh: [
    "标题",
    "研究问题",
    "目标",
    "方法",
    "写作语言",
    "截止日期",
    "导师要求",
    "已有数据",
  ],
};
export function ThesisFlow({
  project,
  refresh,
}: {
  project: any;
  refresh: () => Promise<unknown>;
}) {
  const { locale } = useI18n();
  const c = copy[locale];
  const [text, setText] = useState(project.proposal?.text || "");
  const [requirements, setRequirements] = useState<Requirement[]>(
    project.proposal?.requirements || [],
  );
  const blueprint = project.blueprints?.[0];
  const [blocks, setBlocks] = useState<any[]>(blueprint?.structure || []);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function act(args: Record<string, unknown>) {
    setBusy(true);
    setMessage("");
    try {
      const result = await mutateStudio({
        ...args,
        kind: String(args.kind),
        projectId: project.id,
      });
      await refresh();
      setMessage(c.save);
      return result;
    } catch {
      setMessage(c.error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="thesis-flow" aria-busy={busy}>
      <header>
        <span className="small-label">Proposal → Blueprint → Sections</span>
        <h2>{c.start}</h2>
        <p>{project.title}</p>
      </header>
      <details open={!project.proposal?.confirmedAt}>
        <summary>{c.input}</summary>
        <p>{c.intro}</p>
        <label>
          {c.input}
          <textarea
            rows={7}
            value={text}
            maxLength={100000}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <button
          className="btn primary"
          disabled={busy || text.trim().length < 10}
          onClick={async () => {
            const result = await act({
              kind: "thesis.proposal",
              text,
              version: project.proposal?.version,
            });
            if (result) setRequirements(result.requirements);
          }}
        >
          {c.parse}
        </button>
      </details>
      {!!requirements.length && (
        <details open={!blueprint}>
          <summary>{c.review}</summary>
          <div className="requirements-grid">
            {requirements.map((r, i) => (
              <label key={r.key}>
                {fields[locale][i]}
                <input
                  value={r.value}
                  onChange={(e) =>
                    setRequirements(
                      requirements.map((x) =>
                        x.key === r.key
                          ? { ...x, value: e.target.value, origin: "user" }
                          : x,
                      ),
                    )
                  }
                />
                <small>
                  {r.origin === "missing"
                    ? c.missing
                    : r.origin === "user"
                      ? c.user
                      : c.source}
                </small>
                {r.quote && <blockquote>{r.quote}</blockquote>}
              </label>
            ))}
          </div>
          <button
            className="btn primary"
            disabled={busy}
            onClick={async () => {
              const result = await act({
                kind: "thesis.confirm",
                requirements,
                version: project.proposal?.version,
              });
              if (result) setBlocks(result.structure);
            }}
          >
            {c.confirm}
          </button>
        </details>
      )}
      {!!blocks.length && (
        <details open={!blueprint?.approvedAt}>
          <summary>
            {locale === "cs"
              ? "Osnova"
              : locale === "zh"
                ? "论文蓝图"
                : "Blueprint"}
          </summary>
          <p className="badge">{c.generic}</p>
          <ol className="blueprint-list">
            {blocks.map((b, i) => (
              <li key={b.key}>
                <label>
                  {c.title}
                  <input
                    value={b.title}
                    onChange={(e) =>
                      setBlocks(
                        blocks.map((x) =>
                          x.key === b.key ? { ...x, title: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  {c.requirements}
                  <input
                    value={b.requirements}
                    onChange={(e) =>
                      setBlocks(
                        blocks.map((x) =>
                          x.key === b.key
                            ? { ...x, requirements: e.target.value }
                            : x,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  {c.words}
                  <input
                    type="number"
                    min={0}
                    max={100000}
                    value={b.targetWords}
                    onChange={(e) =>
                      setBlocks(
                        blocks.map((x) =>
                          x.key === b.key
                            ? { ...x, targetWords: Number(e.target.value) }
                            : x,
                        ),
                      )
                    }
                  />
                </label>
              </li>
            ))}
          </ol>
          <button
            className="btn primary"
            disabled={busy}
            onClick={() =>
              void act({
                kind: "thesis.blueprint",
                structure: blocks,
                version: blueprint?.version,
              })
            }
          >
            {c.approve}
          </button>
        </details>
      )}
      {!!project.sections?.length && (
        <div>
          <h3>{c.section}</h3>
          {project.sections.map((s: any) => (
            <div className="thesis-section-row" key={s.id}>
              <Link to={`/project/${project.id}/${s.documentId}`}>
                {s.title} ↗
              </Link>
              <span>
                {statusLabels[locale][s.status] ||
                  s.status.replaceAll("_", " ")}
              </span>
              <select
                aria-label={s.title}
                value=""
                disabled={busy}
                onChange={(e) =>
                  void act({
                    kind: "thesis.status",
                    id: s.id,
                    version: s.version,
                    status: e.target.value,
                  })
                }
              >
                <option value="">→</option>
                {transitions[s.status]?.map((x) => (
                  <option key={x} value={x}>
                    {statusLabels[locale][x] || x.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
      <button
        className="btn secondary"
        disabled={busy}
        onClick={async () => {
          const result = await act({ kind: "thesis.export" });
          if (!result) return;
          const warning =
            locale === "cs"
              ? "Obecný export. Zkontroluj formát školy a aktualizuj obsah ve Wordu."
              : locale === "zh"
                ? "通用格式导出。请核对学校规范，并在 Word 中更新目录。"
                : "Generic export. Check school formatting and update the table of contents in Word.";
          if (!confirm(warning + "\n" + (result.warnings || []).join("\n")))
            return;
          const bytes = Uint8Array.from(atob(result.base64), (c) =>
            c.charCodeAt(0),
          );
          const url = URL.createObjectURL(
            new Blob([bytes], {
              type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            }),
          );
          const link = document.createElement("a");
          link.href = url;
          link.download = "Bakalio-thesis.docx";
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }}
      >
        DOCX ↓
      </button>
      <SectionAI project={project} refresh={refresh} />
      {message && <p role="status">{message}</p>}
    </section>
  );
}
