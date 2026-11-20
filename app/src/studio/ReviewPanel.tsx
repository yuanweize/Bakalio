import { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  getStudio,
  getPublicConfig,
  mutateStudio,
  useQuery,
} from "wasp/client/operations";
import { useI18n } from "./i18n";
const words = {
  en: {
    title: "Comments & evidence",
    comment: "Comment",
    add: "Add comment on selection",
    section: "Leave selection empty for a section comment.",
    resolve: "Resolve",
    reopen: "Reopen",
    claim: "Claim text copied from your saved manuscript",
    track: "Track claim",
    quote: "Exact evidence passage",
    page: "PDF page",
    locate: "Locate passage",
    source: "Source",
    stale: "Stale — review the current version",
    scope:
      "L2 locates exact text only. It does not establish that the text supports this claim.",
    human: "Record human review",
    note: "Reason for your decision",
    error:
      "Unable to save. Check that the document is saved, the selection is unique, and the version is current.",
    history: "Review history",
    select: "Use selected text",
    refresh: "Refresh saved document",
  },
  cs: {
    title: "Komentáře a důkazy",
    comment: "Komentář",
    add: "Přidat komentář k výběru",
    section: "Bez výběru se komentář vztahuje k celé kapitole.",
    resolve: "Vyřešit",
    reopen: "Znovu otevřít",
    claim: "Tvrzení z uloženého textu",
    track: "Sledovat tvrzení",
    quote: "Přesný úryvek zdroje",
    page: "Strana PDF",
    locate: "Najít úryvek",
    source: "Zdroj",
    stale: "Zastaralé — zkontroluj aktuální verzi",
    scope:
      "L2 pouze lokalizuje přesný text. Nepotvrzuje, že úryvek podporuje tvrzení.",
    human: "Zaznamenat vlastní kontrolu",
    note: "Důvod rozhodnutí",
    error:
      "Uložení se nezdařilo. Zkontroluj uložení textu, jednoznačnost výběru a aktuální verzi.",
    history: "Historie kontrol",
    select: "Použít vybraný text",
    refresh: "Obnovit uložený dokument",
  },
  zh: {
    title: "批注与证据",
    comment: "批注",
    add: "为选中文本添加批注",
    section: "未选中文字时，批注针对整个章节。",
    resolve: "解决",
    reopen: "重新打开",
    claim: "从已保存文稿中摘录的论述",
    track: "跟踪论述",
    quote: "来源中的原文片段",
    page: "PDF 页码",
    locate: "定位原文",
    source: "来源",
    stale: "已过期，请审阅当前版本",
    scope: "L2 仅表示定位到原文，不代表原文支持此论述。",
    human: "记录人工审阅",
    note: "判断依据",
    error: "保存失败，请确认文稿已保存、选中内容唯一且版本最新。",
    history: "审阅历史",
    select: "使用选中文字",
    refresh: "刷新已保存文稿",
  },
};
const decisions = {
  en: [
    "Supported",
    "Partially supported",
    "Contradicted",
    "Insufficient evidence",
    "Source unavailable",
  ],
  cs: [
    "Podporuje",
    "Částečně podporuje",
    "Odporuje",
    "Nedostatek důkazů",
    "Zdroj nedostupný",
  ],
  zh: ["支持", "部分支持", "矛盾", "证据不足", "来源不可用"],
};
const values = [
  "supported",
  "partially_supported",
  "contradicted",
  "insufficient_evidence",
  "source_unavailable",
];
export function ReviewPanel({
  documentId,
  editor,
  sources,
}: {
  documentId: string;
  editor: Editor | null;
  sources: any[];
}) {
  const { locale } = useI18n();
  const c = words[locale];
  const config = useQuery(getPublicConfig);
  const query = useQuery(getStudio, { documentId });
  const [body, setBody] = useState(""),
    [claim, setClaim] = useState(""),
    [sourceId, setSource] = useState(sources[0]?.id || ""),
    [quote, setQuote] = useState(""),
    [page, setPage] = useState(1),
    [decision, setDecision] = useState("insufficient_evidence"),
    [note, setNote] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const selected = () =>
    editor?.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      "\n\n",
    ) || "";
  async function act(args: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      await mutateStudio({ ...args, kind: String(args.kind), documentId });
      await query.refetch();
    } catch {
      setError(c.error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="review-panel">
      <summary>{c.title}</summary>
      <button onClick={() => void query.refetch()}>{c.refresh}</button>
      <p>{c.section}</p>
      <label>
        {c.comment}
        <textarea
          maxLength={4000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>
      <button
        disabled={busy || !body.trim()}
        onClick={() =>
          void act({
            kind: "review.comment",
            body,
            quote: selected(),
            version: query.data?.version,
          })
        }
      >
        {c.add}
      </button>
      {query.data?.comments?.map((comment: any) => (
        <article key={comment.id}>
          <blockquote>{comment.quote}</blockquote>
          <p>{comment.body}</p>
          {config.data?.aiEnabled &&
            query.data?.section &&
            comment.status === "open" &&
            comment.quote && (
              <button
                disabled={busy}
                onClick={() => {
                  const question =
                    locale === "cs"
                      ? "Odeslat zadání, vybraný text a komentář poskytovateli AI?"
                      : locale === "zh"
                        ? "将任务书、选中文本与批注发送给已配置的 AI 服务？"
                        : "Send the proposal, selected text and comment to the configured AI provider?";
                  if (confirm(question))
                    void act({
                      kind: "ai.section",
                      sectionId: query.data.section.id,
                      commentId: comment.id,
                      key: crypto.randomUUID(),
                      consent: true,
                    });
                }}
              >
                {locale === "cs"
                  ? "Navrhnout úpravu pomocí AI"
                  : locale === "zh"
                    ? "根据批注请求 AI 修订"
                    : "Request AI revision"}
              </button>
            )}
          <small>
            {comment.anchor.status} · {comment.status}
          </small>
          <button
            disabled={busy}
            onClick={() =>
              void act({
                kind: "review.resolve",
                id: comment.id,
                version: comment.version,
                status: comment.status === "open" ? "resolved" : "open",
              })
            }
          >
            {comment.status === "open" ? c.resolve : c.reopen}
          </button>
        </article>
      ))}
      <hr />
      <label>
        {c.claim}
        <textarea
          maxLength={4000}
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
        />
      </label>
      <button onClick={() => setClaim(selected())}>{c.select}</button>
      <button
        disabled={busy || claim.length < 3}
        onClick={() =>
          void act({
            kind: "review.claim",
            text: claim,
            documentVersion: query.data?.version,
          })
        }
      >
        {c.track}
      </button>
      <label>
        {c.source}
        <select value={sourceId} onChange={(e) => setSource(e.target.value)}>
          <option value="">—</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        {c.page}
        <input
          type="number"
          min={1}
          value={page}
          onChange={(e) => setPage(Number(e.target.value))}
        />
      </label>
      <label>
        {c.quote}
        <textarea
          value={quote}
          maxLength={4000}
          onChange={(e) => setQuote(e.target.value)}
        />
      </label>
      <p>{c.scope}</p>
      <label>
        {c.human}
        <select value={decision} onChange={(e) => setDecision(e.target.value)}>
          {values.map((v, i) => (
            <option key={v} value={v}>
              {decisions[locale][i]}
            </option>
          ))}
        </select>
      </label>
      <label>
        {c.note}
        <textarea
          value={note}
          maxLength={2000}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
      {query.data?.claims?.map((item: any) => (
        <article key={item.id}>
          <strong>{item.text}</strong>
          {item.stale && <p>{c.stale}</p>}
          <button
            disabled={busy || !sourceId || quote.length < 3}
            onClick={() =>
              void act({
                kind: "review.locate",
                claimId: item.id,
                sourceId,
                page,
                quote,
              })
            }
          >
            {c.locate}
          </button>
          {item.assessments.map((a: any) => (
            <div key={a.id}>
              <p>
                {a.level} · {a.outcome} · p. {a.page}
              </p>
              <blockquote>{a.quote}</blockquote>
              {a.stale ? (
                <p>{c.stale}</p>
              ) : (
                <button
                  disabled={busy}
                  onClick={() =>
                    void act({
                      kind: "review.human",
                      claimId: item.id,
                      assessmentId: a.id,
                      decision,
                      note,
                    })
                  }
                >
                  {c.human}
                </button>
              )}
            </div>
          ))}
        </article>
      ))}
      <details>
        <summary>{c.history}</summary>
        {query.data?.reviewEvents?.map((e: any) => (
          <p key={e.id}>
            {e.kind} · {e.details.decision || ""} ·{" "}
            {new Date(e.createdAt).toLocaleString(locale)} · v{e.objectVersion}
          </p>
        ))}
      </details>
      {error && <p role="alert">{error}</p>}
    </details>
  );
}
