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
import { AppFrame, WorkspaceShortcuts } from "./Chrome";
import { Manuscript } from "./Editor";
import { demoFor } from "./demo";
import { useI18n } from "./i18n";
export function Demo() {
  const { t, locale } = useI18n();
  const sample = demoFor(locale);
  const demoSource = sample.source;
  const demoContent = sample.content;
  const view = new URLSearchParams(useLocation().search).get("view");
  return (
    <AppFrame demo>
      <div className="demo-banner">
        <FlaskConical size={17} />
        <span>{t("demoNotice")}</span>
        <Link to="/signup">
          {t("signup")}
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
