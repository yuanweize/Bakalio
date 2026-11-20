import {
  ArrowUpRight,
  BookOpen,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getStudio, mutateStudio, useQuery } from "wasp/client/operations";
import { AppFrame, Modal } from "./Chrome";
import { Pricing } from "./Marketing";
import { SourceVerification } from "./SourceVerification";
import { ThesisFlow } from "./ThesisFlow";
import { brand } from "./brand";
import { useI18n, type Key, type Locale } from "./i18n";
export const defaultProject = {
  title: "",
  language: "cs",
  thesisType: "Bachelor",
  discipline: "",
  question: "",
  method: "",
  citationStyle: "APA 7",
  targetDate: "",
};

export function Workspace() {
  const { section = "overview" } = useParams();
  const { t, locale, theme, setTheme, setLocale } = useI18n();
  const nav = useNavigate();
  const query = useQuery(getStudio, section === "admin" ? { admin: true } : {});
  const data = query.data;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active");
  const [sort, setSort] = useState("recent");
  const [modal, setModal] = useState<"project" | "source" | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = () => query.refetch();
  async function act(a: any) {
    try {
      setError("");
      const result = await mutateStudio(a);
      await refresh();
      return result;
    } catch (e: any) {
      setError(
        e.message?.includes("SOURCE_IN_USE") ? t("sourceInUse") : t("error"),
      );
      throw e;
    }
  }
  async function createDoc(p: any) {
    const title = prompt(t("title"), t("newTitle"));
    if (title) {
      const d = await act({ kind: "document.create", projectId: p.id, title });
      nav(`/project/${p.id}/${d.id}`);
    }
  }
  const projects = data?.projects || [];
  const sources = data?.sources || [];
  const docs = projects
    .flatMap((p: any) => p.documents.map((d: any) => ({ ...d, project: p })))
    .sort((a: any, b: any) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  async function submitProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const input = Object.fromEntries(
      Object.keys(defaultProject).map((k) => [k, String(f.get(k) || "")]),
    );
    try {
      await act({
        kind: editing ? "project.update" : "project.create",
        id: editing?.id,
        data: input,
      });
      setModal(null);
    } catch {
    } finally {
      setBusy(false);
    }
  }
  async function submitSource(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const file = f.get("file") as File;
    let payload: any;
    try {
      if (file?.size) {
        if (file.size > 10 * 1024 * 1024) throw Error();
        const base64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result).split(",")[1]);
          r.onerror = reject;
          r.readAsDataURL(file);
        });
        payload = {
          base64,
          mime: file.name.toLowerCase().endsWith(".pdf")
            ? "application/pdf"
            : "text/plain",
        };
      }
      await act({
        kind: editing ? "source.update" : "source.create",
        id: editing?.id,
        data: {
          title: String(f.get("title")),
          authors: String(f.get("authors")),
          year: String(f.get("year")),
          doi: String(f.get("doi")),
          url: String(f.get("url")),
          tags: String(f.get("tags"))
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          projectId: f.get("projectId") || null,
        },
        file: payload,
      });
      setModal(null);
    } catch {
      setError(t("error"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppFrame>
      <main className="workspace">
        <div className="workspace-heading">
          <div>
            <p className="small-label">
              {section === "overview"
                ? new Date().toLocaleDateString(locale, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : brand.name}
            </p>
            <h1>{section === "overview" ? t("welcome") : t(section as Key)}</h1>
            <p>{section === "overview" ? t("welcomeSub") : ""}</p>
          </div>
          {["overview", "projects", "library"].includes(section) && (
            <button
              className="btn primary"
              onClick={() => {
                setEditing(null);
                setModal(section === "library" ? "source" : "project");
              }}
            >
              <Plus size={18} />
              {t(section === "library" ? "addSource" : "newProject")}
            </button>
          )}
        </div>
        {error && (
          <p role="alert" className="alert">
            {error}
          </p>
        )}
        {query.isLoading ? (
          <p>{t("loading")}</p>
        ) : query.error ? (
          <div className="alert">
            {t("error")}
            <button onClick={() => void refresh()}>{t("retry")}</button>
          </div>
        ) : (
          <>
            {["overview", "projects"].includes(section) && (
              <>
                {section === "overview" && (
                  <>
                    {projects[0] && (
                      <ThesisFlow
                        key={projects[0].id}
                        project={projects[0]}
                        refresh={refresh}
                      />
                    )}
                    {!projects.length && (
                      <section className="onboarding-panel">
                        <h2>{t("onboarding")}</h2>
                        <p>{t("onboardingText")}</p>
                        <ol>
                          <li>
                            <span>1</span>
                            {t("newProject")}
                          </li>
                          <li>
                            <span>2</span>
                            {t("question")}
                          </li>
                          <li>
                            <span>3</span>
                            {t("addSource")} / {t("newDoc")}
                          </li>
                        </ol>
                        <button
                          className="btn primary"
                          onClick={() => {
                            setEditing(null);
                            setModal("project");
                          }}
                        >
                          {t("newProject")}
                          <Plus size={17} />
                        </button>
                      </section>
                    )}
                    {docs[0] && (
                      <Link
                        to={`/project/${docs[0].project.id}/${docs[0].id}`}
                        className="continue-card"
                      >
                        <div className="document-mini">
                          <span />
                          <span />
                          <span />
                          <span />
                        </div>
                        <div>
                          <span className="small-label">{t("continue")}</span>
                          <h2>{docs[0].title}</h2>
                          <p>{docs[0].project.title}</p>
                        </div>
                        <ArrowUpRight size={28} />
                      </Link>
                    )}
                  </>
                )}
                {section === "overview" && sources.length > 0 && (
                  <section>
                    <h2>{t("recentSources")}</h2>
                    <div className="recent-source-list">
                      {sources.slice(0, 3).map((source: any) => (
                        <Link key={source.id} to="/app/library">
                          <BookOpen size={16} /> {source.title}
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
                <div className="section-title">
                  <h2>{t("projects")}</h2>
                  <span>{projects.length}</span>
                </div>
                <div className="filter-bar">
                  <div className="search-box">
                    <Search size={17} />
                    <input
                      aria-label={t("search")}
                      placeholder={t("search")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <select
                    aria-label={t("projects")}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    {["active", "archived", "all"].map((x) => (
                      <option value={x} key={x}>
                        {t(x as Key)}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label={t("recent")}
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    {["recent", "alphabetical"].map((x) => (
                      <option value={x} key={x}>
                        {t(x as Key)}
                      </option>
                    ))}
                  </select>
                </div>
                {!projects.length ? (
                  <div className="empty-state">
                    <BookOpen size={40} />
                    <h2>{t("empty")}</h2>
                    <p>{t("emptyText")}</p>
                    <button
                      className="btn secondary"
                      onClick={() => {
                        setEditing(null);
                        setModal("project");
                      }}
                    >
                      <Plus size={17} />
                      {t("newProject")}
                    </button>
                  </div>
                ) : (
                  <div className="project-list">
                    {projects
                      .filter(
                        (p: any) =>
                          p.title
                            .toLowerCase()
                            .includes(search.toLowerCase()) &&
                          (filter === "all" ||
                            p.archived === (filter === "archived")),
                      )
                      .sort((a: any, b: any) =>
                        sort === "alphabetical"
                          ? a.title.localeCompare(b.title)
                          : +new Date(b.updatedAt) - +new Date(a.updatedAt),
                      )
                      .map((p: any) => (
                        <article className="project-row" key={p.id}>
                          <div className="project-icon">
                            <BookOpen size={23} />
                          </div>
                          <div className="project-content">
                            <div className="row-title">
                              <h3>{p.title}</h3>
                              <span className="badge">
                                {p.archived
                                  ? t("archived")
                                  : p.language.toUpperCase()}
                              </span>
                            </div>
                            <p>{p.question || p.discipline || p.thesisType}</p>
                            <div className="document-links">
                              {p.documents.map((d: any) => (
                                <Link
                                  key={d.id}
                                  to={`/project/${p.id}/${d.id}`}
                                >
                                  <FileText size={13} />
                                  {d.title}
                                </Link>
                              ))}
                              <button onClick={() => void createDoc(p)}>
                                <Plus size={14} />
                                {t("newDoc")}
                              </button>
                            </div>
                          </div>
                          <details className="row-menu">
                            <summary aria-label={t("edit")}>
                              <MoreHorizontal />
                            </summary>
                            <div>
                              <button
                                onClick={() => {
                                  setEditing(p);
                                  setModal("project");
                                }}
                              >
                                {t("edit")}
                              </button>
                              <button
                                onClick={() =>
                                  void act({
                                    kind: "project.archive",
                                    id: p.id,
                                    archived: !p.archived,
                                  }).catch(() => {})
                                }
                              >
                                {t(p.archived ? "unarchive" : "archive")}
                              </button>
                              <button
                                className="danger"
                                onClick={() => {
                                  if (confirm(t("confirmDelete")))
                                    void act({
                                      kind: "project.delete",
                                      id: p.id,
                                    }).catch(() => {});
                                }}
                              >
                                {t("delete")}
                              </button>
                            </div>
                          </details>
                        </article>
                      ))}
                  </div>
                )}
              </>
            )}
            {section === "library" && (
              <>
                <div className="search-box">
                  <Search size={18} />
                  <input
                    aria-label={t("search")}
                    placeholder={t("search")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="source-library">
                  {sources
                    .filter((s: any) =>
                      (s.title + " " + s.authors + " " + s.tags.join(" "))
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    )
                    .map((s: any) => (
                      <article key={s.id}>
                        <BookOpen size={24} />
                        <span className="badge">{t(s.status as Key)}</span>
                        <h3>{s.title}</h3>
                        <p>
                          {s.authors} {s.year}
                        </p>
                        <SourceVerification source={s} refresh={refresh} />
                        <div className="tag-list">
                          {s.tags.map((tag: string) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                        <p>
                          {
                            projects.find((p: any) => p.id === s.projectId)
                              ?.title
                          }
                        </p>
                        <details>
                          <summary>{t("sources")}</summary>
                          {s.chunks.map((c: any) => (
                            <p key={c.page}>
                              <strong>
                                {t("page")} {c.page}
                              </strong>
                              <br />
                              {c.text.slice(0, 1000)}
                            </p>
                          ))}
                        </details>
                        <div className="actions">
                          <button
                            onClick={() => {
                              setEditing(s);
                              setModal("source");
                            }}
                          >
                            {t("edit")}
                          </button>
                          {s.storageKey && (
                            <button
                              onClick={async () => {
                                const f = await act({
                                  kind: "source.download",
                                  id: s.id,
                                });
                                const a = document.createElement("a");
                                a.href = `data:${f.mime};base64,${f.base64}`;
                                a.download =
                                  s.title +
                                  (f.mime === "application/pdf"
                                    ? ".pdf"
                                    : ".txt");
                                a.click();
                              }}
                            >
                              {t("download")}
                            </button>
                          )}
                          <button
                            className="danger"
                            onClick={() => {
                              if (confirm(t("confirmDelete")))
                                void act({
                                  kind: "source.delete",
                                  id: s.id,
                                }).catch(() => {});
                            }}
                          >
                            {t("delete")}
                          </button>
                        </div>
                      </article>
                    ))}
                </div>
                {!sources.length && (
                  <div className="empty-state">
                    <BookOpen size={36} />
                    <h2>{t("empty")}</h2>
                    <p>{t("upload")}</p>
                  </div>
                )}
              </>
            )}
            {section === "settings" && (
              <div className="settings-panel">
                <h2>{t("account")}</h2>
                <p>{data?.user?.email}</p>
                <label>
                  {t("interfaceLanguage")}
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as Locale)}
                  >
                    <option value="cs">Čeština</option>
                    <option value="en">English</option>
                    <option value="zh">简体中文</option>
                  </select>
                </label>
                <label>
                  {t("theme")}
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option value="light">{t("light")}</option>
                    <option value="dark">{t("dark")}</option>
                  </select>
                </label>
                <button
                  className="btn primary"
                  onClick={() =>
                    void act({
                      kind: "settings",
                      data: { locale, theme },
                    }).catch(() => {})
                  }
                >
                  {t("save")}
                </button>
                <p>{t("privacyText")}</p>
                <Link to={`/${locale}/support`}>{t("support")}</Link>
                {data?.isAdmin && <Link to="/app/admin">{t("admin")}</Link>}
              </div>
            )}
            {section === "usage" && (
              <div className="settings-panel">
                <h2>
                  {data?.usage?._sum?.units || 0} {t("units")}
                </h2>
                <p>{t("zeroUsage")}</p>
                <p>
                  {projects.length} {t("projects")} / {sources.length}{" "}
                  {t("sources")} / {docs.length} {t("documents")}
                </p>
              </div>
            )}
            {section === "billing" && <Pricing />}
            {section === "admin" && (
              <div className="settings-panel">
                <h2>{t("account")}</h2>
                {data?.users?.map((u: any) => (
                  <p key={u.id}>{u.email}</p>
                ))}
                <h2>AI</h2>
                {data?.jobs?.map((j: any) => (
                  <p key={j.id}>
                    {j.type}: {j.status}
                  </p>
                ))}
                <h2>{t("support")}</h2>
                {data?.messages?.map((m: any) => (
                  <p key={m.id}>
                    {m.email}: {m.message}
                  </p>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Modal
        open={!!modal}
        onOpenChange={(b) => {
          if (!b) setModal(null);
        }}
        title={t(modal === "source" ? "addSource" : "newProject")}
      >
        <form
          className="stack-form"
          onSubmit={modal === "source" ? submitSource : submitProject}
        >
          {modal === "project" ? (
            <>
              {Object.entries(defaultProject).map(([k, v]) => (
                <label key={k}>
                  {t(k as Key)}
                  {k === "language" ? (
                    <select name={k} defaultValue={editing?.[k] || v}>
                      <option value="cs">Čeština</option>
                      <option value="en">English</option>
                      <option value="zh">简体中文</option>
                    </select>
                  ) : ["question", "method"].includes(k) ? (
                    <textarea
                      name={k}
                      defaultValue={editing?.[k] || v}
                      maxLength={4000}
                    />
                  ) : (
                    <input
                      name={k}
                      required={k === "title"}
                      type={k === "targetDate" ? "date" : "text"}
                      maxLength={300}
                      defaultValue={editing?.[k] || v}
                    />
                  )}
                </label>
              ))}
            </>
          ) : (
            <>
              {["title", "authors", "year", "doi", "url", "tags"].map((k) => (
                <label key={k}>
                  {k === "doi" ? "DOI" : k === "url" ? "URL" : t(k as Key)}
                  <input
                    name={k}
                    required={k === "title"}
                    type={k === "url" ? "url" : "text"}
                    defaultValue={
                      k === "tags"
                        ? editing?.tags.join(", ")
                        : editing?.[k] || ""
                    }
                  />
                </label>
              ))}
              <label>
                {t("project")}
                <select
                  name="projectId"
                  defaultValue={editing?.projectId || ""}
                >
                  <option value="">{t("none")}</option>
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </label>
              {!editing && (
                <label>
                  {t("upload")}
                  <input
                    name="file"
                    type="file"
                    accept=".pdf,.txt,application/pdf,text/plain"
                  />
                </label>
              )}
            </>
          )}
          {error && (
            <p role="alert" className="alert">
              {error}
            </p>
          )}
          <button disabled={busy} className="btn primary">
            {busy ? t("loading") : t("save")}
          </button>
        </form>
      </Modal>
    </AppFrame>
  );
}
