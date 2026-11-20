import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  FileText,
  FlaskConical,
  Folder,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { getStudio, mutateStudio, useQuery } from "wasp/client/operations";
import { AppFrame, Footer, PublicHeader, WorkspaceShortcuts } from "./Chrome";
import { ThesisDemo } from "./ThesisDemo";
import { Manuscript } from "./Editor";
import { demoFor } from "./demo";
import { useI18n } from "./i18n";
export function Demo() {
  const { t, locale } = useI18n();
  const sample = demoFor(locale);
  const demoSource = sample.source;
  const demoContent = sample.content;
  const view = new URLSearchParams(useLocation().search).get("view");
  if (view === "studio") {
    const heading =
      locale === "cs"
        ? "Od zadání k první kapitole. Vyzkoušej si to."
        : locale === "zh"
          ? "从任务书到第一章，现在亲手体验。"
          : "From your proposal to your first chapter. Try it.";
    const explanation =
      locale === "cs"
        ? "Proklikni si osnovu, uprav kapitolu a zkontroluj důkazy. Jde o připravenou ukázku bez AI volání."
        : locale === "zh"
          ? "体验论文蓝图、章节编辑、批注修订和证据检查。这是预设引导演示，不调用 AI。"
          : "Explore a thesis blueprint, edit a chapter, review a revision and inspect its evidence. This guided example makes no AI calls.";
    const editorLink =
      locale === "cs"
        ? "Otevřít editor na zkoušku"
        : locale === "zh"
          ? "继续体验文稿编辑器"
          : "Open the manuscript sandbox";
    return (
      <>
        <PublicHeader />
        <main className="demo-guided-page">
          <header className="demo-guided-intro">
            <span className="small-label">
              Bakalio / Interactive thesis studio
            </span>
            <h1>{heading}</h1>
            <p>{explanation}</p>
          </header>
          <ThesisDemo />
          <div className="demo-guided-next">
            <div>
              <strong>
                {locale === "cs"
                  ? "Chceš si vyzkoušet psaní?"
                  : locale === "zh"
                    ? "想继续实际编辑文稿？"
                    : "Want to try editing a manuscript?"}
              </strong>
              <p>
                {locale === "cs"
                  ? "Samostatný editor je také jen testovací prostředí; změny se neukládají na server."
                  : locale === "zh"
                    ? "打开隔离编辑器，实际编辑示例文本；修改不会保存到服务器。"
                    : "Open the isolated editor to change a sample manuscript. Edits never reach a server account."}
              </p>
            </div>
            <Link className="btn primary" to="/demo">
              {editorLink}
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  return (
    <AppFrame demo>
      <div className="demo-banner">
        <FlaskConical size={17} />
        <span>{t("demoNotice")}</span>
        <Link to="/demo?view=studio">
          {t("demo")}
          <ArrowUpRight size={15} />
        </Link>
      </div>
      {view ? (
        <main className="workspace">
          <div className="workspace-heading">
            <div>
              <span className="badge">{t("demoLabel")}</span>
              <h1>{t(view === "library" ? "library" : "welcome")}</h1>
              <p>{t("demoNotice")}</p>
            </div>
            <Link className="btn primary" to="/demo">
              {t("continue")}
              <ArrowUpRight size={17} />
            </Link>
          </div>
          {view === "library" ? (
            <div className="source-library">
              <article>
                <BookOpen />
                <h3>{demoSource.title}</h3>
                <p>
                  {demoSource.authors} · {demoSource.year}
                </p>
                <p>{demoSource.chunks[0].text}</p>
                <span className="badge">{t("demoLabel")}</span>
              </article>
            </div>
          ) : (
            <>
              <div className="stats-row">
                <div>
                  <Folder />
                  <strong>1</strong>
                  <span>{t("projects")}</span>
                </div>
                <div>
                  <FileText />
                  <strong>1</strong>
                  <span>{t("documents")}</span>
                </div>
                <div>
                  <BookOpen />
                  <strong>1</strong>
                  <span>{t("sources")}</span>
                </div>
              </div>
              <WorkspaceShortcuts demo />
              <Link to="/demo" className="continue-card">
                <div className="document-mini">
                  <span />
                  <span />
                  <span />
                </div>
                <div>
                  <span className="small-label">{t("continue")}</span>
                  <h2>{sample.title}</h2>
                  <p>{t("demoLabel")}</p>
                </div>
                <ArrowUpRight />
              </Link>
            </>
          )}
        </main>
      ) : (
        <Manuscript
          demo
          document={{
            id: "demo",
            title: sample.title,
            content: demoContent,
            version: 1,
            revisions: [],
          }}
          sources={[demoSource]}
        />
      )}
    </AppFrame>
  );
}

export function EditorPage() {
  const { projectId, documentId } = useParams();
  const { t } = useI18n();
  const q = useQuery(getStudio, { documentId });
  const all = useQuery(getStudio, { projectId });
  const [generation, setGeneration] = useState(0);
  const reload = async () => {
    await q.refetch();
    setGeneration((x) => x + 1);
  };
  return (
    <AppFrame>
      <div className="editor-breadcrumb">
        <Link to="/app">
          <ArrowRight size={15} style={{ transform: "rotate(180deg)" }} />
          {t("projects")}
        </Link>
        <span>
          {all.data?.projects?.find((p: any) => p.id === projectId)?.title}
        </span>
      </div>
      {q.error || all.error ? (
        <div className="alert">
          {t("error")}
          <button onClick={() => void reload()}>{t("retry")}</button>
        </div>
      ) : !q.data || !all.data ? (
        <p>{t("loading")}</p>
      ) : (
        <Manuscript
          key={documentId + "-" + generation}
          document={q.data}
          sources={all.data.sources.filter(
            (s: any) => !s.projectId || s.projectId === projectId,
          )}
          onSave={(content, title, version) =>
            mutateStudio({
              kind: "document.save",
              id: documentId,
              content,
              title,
              version,
            })
          }
          onReload={() => void reload()}
          onRestore={(r, version) =>
            mutateStudio({
              kind: "document.restore",
              id: documentId,
              revisionId: r.id,
              version,
              title: r.title,
            })
          }
          onCitation={(s, page) =>
            mutateStudio({
              kind: "citation.create",
              documentId,
              sourceId: s.id,
              page,
            })
          }
        />
      )}
    </AppFrame>
  );
}
