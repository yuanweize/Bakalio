import { useState } from "react";
import {
  useQuery,
  getPublicConfig,
  mutateStudio,
  getStudio,
} from "wasp/client/operations";
import { useI18n } from "./i18n";
import { textOf } from "./content";
const messages = {
  en: {
    heading: "Section assistant",
    disabled:
      "Live AI is not enabled. You can write and review every section manually.",
    consent:
      "Send this proposal and section requirements to the configured AI provider. No source files are sent.",
    generate: "Request a draft",
    cancel: "Cancel",
    accept: "Accept draft",
    reject: "Reject",
    before: "Current document",
    after: "Suggested draft",
    error:
      "Task failed. Check quota, configuration and current document version before retrying.",
    warning:
      "Review every statement. This draft has not been evidence-verified.",
  },
  cs: {
    heading: "Asistent kapitoly",
    disabled:
      "AI není zapnutá. Každou kapitolu můžeš psát a kontrolovat ručně.",
    consent:
      "Odeslat zadání a požadavky kapitoly nastavenému poskytovateli AI. Soubory zdrojů se neodesílají.",
    generate: "Navrhnout koncept",
    cancel: "Zrušit",
    accept: "Přijmout koncept",
    reject: "Odmítnout",
    before: "Aktuální text",
    after: "Navržený koncept",
    error:
      "Úloha se nezdařila. Zkontroluj limit, nastavení a aktuální verzi textu.",
    warning: "Zkontroluj každé tvrzení. Zdroje tohoto konceptu nebyly ověřeny.",
  },
  zh: {
    heading: "章节助手",
    disabled: "真实 AI 尚未启用，你仍可手动撰写和审阅所有章节。",
    consent: "将任务书和本章节要求发送给已配置的 AI 服务，不发送来源附件。",
    generate: "请求初稿",
    cancel: "取消",
    accept: "接受初稿",
    reject: "拒绝",
    before: "当前文稿",
    after: "建议初稿",
    error: "任务失败，请检查额度、配置和文稿版本后重试。",
    warning: "请逐条审阅，本初稿尚未进行证据核验。",
  },
};
export function SectionAI({
  project,
  refresh,
}: {
  project: any;
  refresh: () => Promise<unknown>;
}) {
  const { locale } = useI18n();
  const c = messages[locale];
  const config = useQuery(getPublicConfig);
  const tasks = useQuery(getStudio, {}, { refetchInterval: 5000 });
  const [consent, setConsent] = useState(false);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function act(args: any) {
    setBusy(true);
    setError("");
    try {
      await mutateStudio(args);
      await tasks.refetch();
      await refresh();
    } catch {
      setError(c.error);
    } finally {
      setBusy(false);
    }
  }
  if (!project.sections?.length) return null;
  const jobs = (tasks.data?.aiTasks || []).filter((j: any) =>
    project.sections.some((s: any) => s.id === j.sectionId),
  );
  return (
    <section className="thesis-flow">
      <h3>{c.heading}</h3>
      {!config.data?.aiEnabled ? (
        <p>{c.disabled}</p>
      ) : (
        <>
          <label>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            {c.consent} ({config.data.aiProvider})
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            aria-label={c.heading}
          >
            <option value="">—</option>
            {project.sections
              .filter((s: any) =>
                [
                  "ready",
                  "draft",
                  "revision_requested",
                  "failed",
                  "needs_human_input",
                ].includes(s.status),
              )
              .map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
          </select>
          <button
            className="btn primary"
            disabled={busy || !consent || !selected}
            onClick={() =>
              void act({
                kind: "ai.section",
                sectionId: selected,
                key: crypto.randomUUID(),
                consent,
              })
            }
          >
            {c.generate}
          </button>
        </>
      )}
      {jobs.map((job: any) => {
        const section = project.sections.find(
          (s: any) => s.id === job.sectionId,
        );
        const doc = project.documents.find(
          (d: any) => d.id === section?.documentId,
        );
        return (
          <article key={job.id}>
            <h4>{section?.title}</h4>
            <p role="status">
              {job.status} · {job.inputTokens + job.outputTokens} tokens
            </p>
            {["queued", "running"].includes(job.status) && (
              <button
                disabled={busy}
                onClick={() => void act({ kind: "ai.cancel", id: job.id })}
              >
                {c.cancel}
              </button>
            )}
            {["queued", "running"].includes(job.status) &&
              Date.now() - new Date(job.createdAt).getTime() > 120000 && (
                <button
                  disabled={busy}
                  onClick={() => void act({ kind: "ai.recover", id: job.id })}
                >
                  {locale === "cs"
                    ? "Obnovit přerušenou úlohu"
                    : locale === "zh"
                      ? "恢复中断任务"
                      : "Recover interrupted task"}
                </button>
              )}
            {job.status === "completed" && (
              <>
                <p>{c.warning}</p>
                <div className="requirements-grid">
                  <div>
                    <h5>{c.before}</h5>
                    <pre style={{ whiteSpace: "pre-wrap" }}>
                      {doc ? textOf(doc.content) : ""}
                    </pre>
                  </div>
                  <div>
                    <h5>{c.after}</h5>
                    <pre style={{ whiteSpace: "pre-wrap" }}>
                      {job.output?.text}
                    </pre>
                  </div>
                </div>
                <button
                  disabled={busy}
                  onClick={() => void act({ kind: "ai.accept", id: job.id })}
                >
                  {c.accept}
                </button>
                <button
                  disabled={busy}
                  onClick={() => void act({ kind: "ai.reject", id: job.id })}
                >
                  {c.reject}
                </button>
              </>
            )}
          </article>
        );
      })}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
