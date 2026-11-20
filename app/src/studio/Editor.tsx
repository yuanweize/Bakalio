import { ReviewPanel } from "./ReviewPanel";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import { Node, mergeAttributes } from "@tiptap/core";
import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  PanelLeft,
  PanelRight,
  Check,
  History,
  Download,
  Bold,
  Italic,
  Heading2,
  List,
  Quote,
  Link as LinkIcon,
  Table as TableIcon,
  Sparkles,
  ChevronRight,
  FileText,
  X,
} from "lucide-react";
import { brand } from "./brand";
import { useI18n } from "./i18n";
import { type RichNode, textOf, markdownOf, wordCount } from "./content";
import { demoFor, demoContent, demoSource } from "./demo";
import { MockAdapter, runTask, type TaskResult } from "../ai/provider";
export const CitationNode = Node.create({
  name: "citation",
  group: "inline",
  inline: true,
  atom: true,
  addAttributes() {
    return {
      sourceId: { default: null },
      citationId: { default: null },
      label: { default: "source" },
    };
  },
  parseHTML() {
    return [{ tag: "span[data-citation]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-citation": "true",
        class: "citation-chip",
        role: "button",
        tabindex: "0",
        "aria-label": HTMLAttributes.label,
      }),
      `[${HTMLAttributes.label}]`,
    ];
  },
});
export function downloadText(text: string, name: string, mime = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function Manuscript({
  document: doc,
  sources = [],
  demo = false,
  preview = false,
  onSave,
  onCitation,
  onReload,
  onRestore,
}: {
  document: any;
  sources?: any[];
  demo?: boolean;
  preview?: boolean;
  onSave?: (content: RichNode, title: string, version: number) => Promise<any>;
  onCitation?: (source: any, page?: number) => Promise<any>;
  onReload?: () => void;
  onRestore?: (revision: any, version: number) => Promise<any>;
}) {
  const { t, locale } = useI18n();
  const [title, setTitle] = useState(doc.title);
  const [status, setStatus] = useState("saved");
  const [left, setLeft] = useState(true);
  const [right, setRight] = useState(true);
  const [tab, setTab] = useState("sources");
  const [mobile, setMobile] = useState("manuscript");
  const [history, setHistory] = useState(false);
  const [revision, setRevision] = useState<any>(null);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [task, setTask] = useState("outline");
  const [error, setError] = useState("");
  const [selectedSource, setSelectedSource] = useState(sources[0]?.id || "");
  const [page, setPage] = useState("");
  const [tick, setTick] = useState(0);
  const version = useRef(doc.version || 1);
  const current = useRef(doc.content as RichNode);
  const changed = useRef(false);
  const inFlight = useRef(false);
  const titleRef = useRef(title);
  const generation = useRef(0);
  const conflict = useRef(false);
  const openCitation = (target: EventTarget | null) => {
    const chip =
      target instanceof HTMLElement ? target.closest("[data-citation]") : null;
    if (!chip) return false;
    setSelectedSource(chip.getAttribute("sourceid") || "");
    setRight(true);
    setTab("sources");
    setMobile("sources");
    return true;
  };
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, protocols: ["http", "https", "mailto"] },
      }),
      TableKit,
      CitationNode,
    ],
    content: doc.content,
    editable: !preview,
    immediatelyRender: false,
    editorProps: {
      attributes: { "aria-label": t("manuscript") },
      handleClick: (_view, _pos, event) => openCitation(event.target),
      handleDOMEvents: {
        keydown: (_view, event) => {
          if (
            (event.key === "Enter" || event.key === " ") &&
            openCitation(event.target)
          ) {
            event.preventDefault();
            return true;
          }
          return false;
        },
      },
    },
    onUpdate: ({ editor }) => {
      current.current = editor.getJSON() as RichNode;
      changed.current = true;
      generation.current++;
      setStatus("unsaved");
      setTick((x) => x + 1);
    },
  });
  const previousLocale = useRef(locale);
  useEffect(() => {
    if (demo && previousLocale.current !== locale && !changed.current) {
      editor?.commands.setContent(doc.content, { emitUpdate: false });
      setTitle(doc.title);
      current.current = doc.content;
    }
    previousLocale.current = locale;
  }, [locale, editor, demo, doc.content, doc.title]);
  useEffect(() => {
    titleRef.current = title;
  }, [title]);
  async function save() {
    if (!onSave || !changed.current || inFlight.current || conflict.current)
      return;
    inFlight.current = true;
    const g = generation.current;
    setStatus("saving");
    try {
      const saved = await onSave(
        current.current,
        titleRef.current,
        version.current,
      );
      version.current = saved.version;
      if (generation.current === g) {
        changed.current = false;
        setStatus("saved");
      } else setStatus("unsaved");
    } catch (e: any) {
      if (e.message?.includes("CONFLICT") || e.statusCode === 409) {
        conflict.current = true;
        setStatus("conflict");
      } else setStatus("error");
    } finally {
      inFlight.current = false;
    }
  }
  useEffect(() => {
    if (demo) {
      setStatus("saved");
      return;
    }
    const timer = setInterval(() => {
      void save();
    }, 1300);
    return () => clearInterval(timer);
  }, [onSave, demo]);
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (changed.current && !demo) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [demo]);
  const items = sources.length ? sources : demo ? [demoSource] : [];
  const selected = items.find((s) => s.id === selectedSource) || items[0];
  async function insert(source: any) {
    try {
      const cite = demo
        ? { id: "demo-" + Date.now() }
        : await onCitation?.(source, page ? Number(page) : undefined);
      if (!cite) return;
      editor
        ?.chain()
        .focus()
        .insertContent({
          type: "citation",
          attrs: {
            sourceId: source.id,
            citationId: cite.id,
            label: `${source.authors || source.title}, ${source.year || "n.d."}${page ? ", p. " + page : ""}`,
          },
        })
        .run();
    } catch {
      setError(t("error"));
    }
  }
  async function suggest() {
    if (!demo) return;
    setResult(null);
    let text =
      editor?.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        " ",
      ) || "";
    if (task === "rewrite" && !text) {
      setError(t("selection"));
      return;
    }
    setError("");
    await runTask(
      new MockAdapter(),
      {
        task: task as any,
        text,
        sources: [],
        idempotencyKey: crypto.randomUUID(),
      },
      new AbortController().signal,
      (e) => {
        if (e.type === "result") setResult(e.result);
      },
    );
  }
  const headingNodes = (editor?.getJSON().content || []).filter(
    (n) => n.type === "heading",
  );
  return (
    <div
      className={`manuscript-shell ${preview ? "preview" : ""} ${!left ? "hide-left" : ""} ${!right ? "hide-right" : ""}`}
    >
      {!preview && (
        <>
          <div className="doc-bar">
            <div className="doc-name">
              <FileText size={17} />
              <input
                aria-label={t("title")}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  titleRef.current = e.target.value;
                  changed.current = true;
                  generation.current++;
                  setStatus("unsaved");
                }}
              />
              <span className={"save-state " + status} role="status">
                <Check size={13} />
                {demo
                  ? t("demoLabel")
                  : t(
                      status === "conflict" || status === "error"
                        ? "unsaved"
                        : (status as any),
                    )}
              </span>
            </div>
            <div className="doc-actions">
              <button
                title={t("toggleOutline")}
                aria-label={t("toggleOutline")}
                onClick={() => setLeft(!left)}
              >
                <PanelLeft size={18} />
              </button>
              <button onClick={() => setHistory(!history)}>
                <History size={16} />
                <span>{t("versions")}</span>
              </button>
              <details className="export-menu">
                <summary>
                  <Download size={16} />
                  {t("export")}
                </summary>
                <button
                  onClick={() =>
                    downloadText(
                      markdownOf(current.current),
                      title + ".md",
                      "text/markdown",
                    )
                  }
                >
                  Markdown
                </button>
                <button
                  onClick={() =>
                    downloadText(textOf(current.current), title + ".txt")
                  }
                >
                  {t("plain")}
                </button>
              </details>
              <button
                title={t("toggleSources")}
                aria-label={t("toggleSources")}
                onClick={() => setRight(!right)}
              >
                <PanelRight size={18} />
              </button>
            </div>
          </div>
          <div className="mobile-tabs">
            {["manuscript", "sources", "assistant"].map((x) => (
              <button
                className={mobile === x ? "selected" : ""}
                key={x}
                onClick={() => {
                  setMobile(x);
                  if (x !== "manuscript") setTab(x);
                }}
              >
                {t(x as any)}
              </button>
            ))}
          </div>
        </>
      )}
      {status === "conflict" && (
        <div className="alert">
          {t("conflict")} <button onClick={onReload}>{t("reload")}</button>
        </div>
      )}
      {status === "error" && (
        <div className="alert">
          {t("error")} <button onClick={() => void save()}>{t("retry")}</button>
        </div>
      )}
      <div className={"editor-grid mobile-" + mobile}>
        <aside className="outline-pane">
          <div className="pane-title">
            <BookOpen size={15} />
            {t("outlineNav")}
          </div>
          {headingNodes.map((n: any, i: number) => (
            <button
              key={i}
              className={i === 1 ? "selected" : ""}
              onClick={() => {
                const heads = document.querySelectorAll(
                  ".tiptap h1,.tiptap h2,.tiptap h3",
                );
                heads[i]?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }}
            >
              <span className="outline-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              {textOf(n)}
            </button>
          ))}
          <div className="outline-bottom">
            <span className="small-label">{t("manuscript")}</span>
            <strong>
              {wordCount(current.current)} <small>{t("words")}</small>
            </strong>
            <div className="quiet-rule" />
            <p>{demo ? t("demoLabel") : brand.name}</p>
          </div>
        </aside>
        <section className="writing-pane">
          {!preview && (
            <div className="format-bar">
              {[
                [
                  Bold,
                  "bold",
                  () => editor?.chain().focus().toggleBold().run(),
                ],
                [
                  Italic,
                  "italic",
                  () => editor?.chain().focus().toggleItalic().run(),
                ],
                [
                  Heading2,
                  "heading",
                  () =>
                    editor?.chain().focus().toggleHeading({ level: 2 }).run(),
                ],
                [
                  List,
                  "list",
                  () => editor?.chain().focus().toggleBulletList().run(),
                ],
                [
                  Quote,
                  "quote",
                  () => editor?.chain().focus().toggleBlockquote().run(),
                ],
                [
                  LinkIcon,
                  "link",
                  () => {
                    const href = prompt(t("link"), "https://");
                    if (href && /^https?:\/\//i.test(href))
                      editor?.chain().focus().setLink({ href }).run();
                  },
                ],
                [
                  TableIcon,
                  "table",
                  () =>
                    editor
                      ?.chain()
                      .focus()
                      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                      .run(),
                ],
              ].map(([Icon, label, fn]: any) => (
                <button
                  key={label}
                  title={t(label)}
                  aria-label={t(label)}
                  onClick={fn}
                >
                  <Icon size={17} />
                </button>
              ))}
              <span>{t("manuscript")}</span>
            </div>
          )}
          <div className="paper">
            <div className="paper-meta">
              <span>{t("manuscript")}</span>
              <span>
                {demo
                  ? t("teachingExample")
                  : doc.project?.citationStyle || "APA 7"}
              </span>
            </div>
            <EditorContent editor={editor} />
          </div>
        </section>
        <aside className="research-pane">
          <div className="research-tabs">
            <button
              className={tab === "sources" ? "selected" : ""}
              onClick={() => setTab("sources")}
            >
              <BookOpen size={15} />
              {t("sources")}
            </button>
            <button
              className={tab === "assistant" ? "selected" : ""}
              onClick={() => setTab("assistant")}
            >
              <Sparkles size={15} />
              {t("assistant")}
            </button>
          </div>
          {tab === "sources" ? (
            <div className="source-panel">
              <p className="small-label">{t("sourceNotes")}</p>
              {items.length === 0 ? (
                <p>{t("empty")}</p>
              ) : (
                <>
                  <select
                    aria-label={t("sources")}
                    value={selected?.id}
                    onChange={(e) => setSelectedSource(e.target.value)}
                  >
                    {items.map((s) => (
                      <option value={s.id} key={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                  <div className="source-note">
                    <span className="source-type">
                      {demo ? t("teachingMaterial") : t("sources")}
                    </span>
                    <h3>{selected?.title}</h3>
                    <p>
                      {selected?.authors} • {selected?.year}
                    </p>
                    <div className="quiet-rule" />
                    {selected?.chunks?.slice(0, 5).map((c: any) => (
                      <blockquote key={c.page}>
                        <small>
                          {t("page")} {c.page}
                        </small>
                        {c.text.slice(0, 650)}
                      </blockquote>
                    ))}
                    <span className="source-status">
                      {demo
                        ? t("demoLabel")
                        : t((selected?.status || "manual") as any)}
                    </span>
                  </div>
                  {!preview && (
                    <>
                      <label>
                        {t("page")}
                        <input
                          type="number"
                          min="1"
                          value={page}
                          onChange={(e) => setPage(e.target.value)}
                        />
                      </label>
                      <button
                        className="btn secondary full"
                        onClick={() => void insert(selected)}
                      >
                        {t("insertCitation")}
                        <ChevronRight size={15} />
                      </button>
                    </>
                  )}
                </>
              )}
              <p className="fine-print">{t("a2")}</p>
            </div>
          ) : (
            <div className="source-panel">
              <div className="assistant-symbol">
                <Sparkles size={25} />
              </div>
              <h3>{demo ? t("mock") : t("assistant")}</h3>
              <p>{demo ? t("aiHint") : t("aiDisabled")}</p>
              {demo && (
                <>
                  <label>
                    {t("assistant")}
                    <select
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                    >
                      {[
                        ["outline", "outlineTask"],
                        ["summarize", "summarize"],
                        ["rewrite", "rewrite"],
                        ["sources", "checkSources"],
                      ].map(([v, l]) => (
                        <option value={v} key={v}>
                          {t(l as any)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="btn primary full"
                    onClick={() => void suggest()}
                  >
                    <Sparkles size={15} />
                    {t("mock")}
                  </button>
                  {result && (
                    <div className="suggestion">
                      <span className="badge">{t("mock")}</span>
                      <p>{result.text}</p>
                      <div className="actions">
                        <button
                          className="btn secondary"
                          onClick={() => {
                            editor
                              ?.chain()
                              .focus()
                              .insertContent({
                                type: "paragraph",
                                content: [{ type: "text", text: result.text }],
                              })
                              .run();
                            setResult(null);
                          }}
                        >
                          {t("accept")}
                        </button>
                        <button onClick={() => setResult(null)}>
                          {t("reject")}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {error && (
            <p role="alert" className="alert">
              {error}
            </p>
          )}
        </aside>
      </div>
      {!demo && !preview && (
        <ReviewPanel documentId={doc.id} editor={editor} sources={sources} />
      )}
      {history && (
        <section className="version-panel">
          <div className="section-title">
            <h3>{t("versions")}</h3>
            <button aria-label={t("close")} onClick={() => setHistory(false)}>
              <X size={18} />
            </button>
          </div>
          {!(doc.revisions || []).length ? (
            <p>{t("empty")}</p>
          ) : (
            <>
              <div className="version-list">
                {doc.revisions.map((r: any) => (
                  <button
                    className="btn secondary"
                    key={r.id}
                    onClick={() => setRevision(r)}
                  >
                    v{r.version} ·{" "}
                    {new Date(r.createdAt).toLocaleString(locale)}
                  </button>
                ))}
              </div>
              {revision && (
                <>
                  <pre>{textOf(revision.content)}</pre>
                  <button
                    className="btn primary"
                    onClick={async () => {
                      try {
                        await onRestore?.(revision, version.current);
                        setHistory(false);
                        onReload?.();
                      } catch {
                        setError(t("conflict"));
                      }
                    }}
                  >
                    {t("restore")}
                  </button>
                </>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
export function ProductPreview() {
  const { locale } = useI18n();
  const sample = demoFor(locale);
  return (
    <Manuscript
      key={locale}
      preview
      demo
      document={{
        title: sample.title,
        content: sample.content,
        version: 1,
      }}
      sources={[sample.source]}
    />
  );
}
