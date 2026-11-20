import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  FileText,
  History,
  ListTree,
  Quote,
} from "lucide-react";
import { useI18n } from "./i18n";
import { demoFor } from "./demo";
import { textOf } from "./content";

export function ProductJourney() {
  const { locale, t } = useI18n();
  const demo = demoFor(locale);
  const [step, setStep] = useState(0),
    [evidence, setEvidence] = useState(false),
    [saved, setSaved] = useState(false),
    [history, setHistory] = useState(false);
  const [draft, setDraft] = useState<string | null>(null),
    [previous, setPrevious] = useState<string | null>(null);
  const excerpt = demo.content.content![3].content![0].text!;
  const tabs = [t("previewSources"), t("previewOutline"), t("previewWrite")];
  return (
    <div className="journey" aria-label={t("previewLabel")}>
      <div className="journey-bar">
        <span className="journey-mark" aria-hidden="true">
          b.
        </span>
        <span>{t("previewLabel")}</span>
        <span className="journey-dot" />
      </div>
      <div className="journey-tabs" role="tablist" aria-label={t("workflow")}>
        {tabs.map((tab, i) => (
          <button
            id={`journey-tab-${i}`}
            key={i}
            role="tab"
            aria-selected={step === i}
            aria-controls="journey-panel"
            tabIndex={step === i ? 0 : -1}
            onClick={() => setStep(i)}
            onKeyDown={(e) => {
              if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                const next =
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? 2
                      : (i + (e.key === "ArrowLeft" ? 2 : 1)) % 3;
                setStep(next);
                document.getElementById(`journey-tab-${next}`)?.focus();
              }
            }}
          >
            <span>{i + 1}</span>
            {tab}
          </button>
        ))}
      </div>
      <div
        id="journey-panel"
        role="tabpanel"
        aria-labelledby={`journey-tab-${step}`}
        className="journey-panel"
      >
        {step === 0 ? (
          <>
            <div className="journey-heading">
              <BookOpen size={20} />
              <span>{t("library")}</span>
              <span className="badge">PDF</span>
            </div>
            <button
              className="journey-source"
              onClick={() => setEvidence(!evidence)}
              aria-expanded={evidence}
            >
              <div className="source-cover">
                <span>b.</span>
                <BookOpen size={32} />
              </div>
              <div>
                <span className="small-label">{t("teachingMaterial")}</span>
                <h3>{demo.source.title}</h3>
                <p>
                  {demo.source.authors} · {demo.source.year}
                </p>
                <span className="text-link">{t("previewEvidence")}</span>
              </div>
              <ArrowUpRight size={18} />
            </button>
            {evidence ? (
              <blockquote className="journey-evidence">
                <Quote size={18} />
                <p>{demo.source.chunks[0].text}</p>
                <span>
                  {t("page")} 12 · {t("demoLabel")}
                </span>
              </blockquote>
            ) : (
              <p className="journey-hint">{t("collectText")}</p>
            )}
          </>
        ) : step === 1 ? (
          <>
            <div className="journey-heading">
              <ListTree size={20} />
              <span>{t("outline")}</span>
            </div>
            <h3>{demo.title}</h3>
            <ol className="journey-outline">
              {demo.content
                .content!.filter(
                  (n) => n.type === "heading" && n.attrs?.level === 2,
                )
                .map((n, i) => (
                  <li key={i}>
                    <span>{textOf(n)}</span>
                    <button onClick={() => setStep(2)}>
                      {t("edit")}
                      <ArrowUpRight size={15} />
                    </button>
                  </li>
                ))}
            </ol>
            <p className="journey-hint">{t("outlineText")}</p>
          </>
        ) : (
          <>
            <div className="journey-heading">
              <FileText size={20} />
              <span>{t("manuscript")}</span>
              <button
                aria-label={t("versions")}
                onClick={() => setHistory(!history)}
                aria-expanded={history}
              >
                <History size={18} />
              </button>
            </div>
            <h3>{demo.title}</h3>
            <label className="journey-draft">
              <span className="sr-only">{t("manuscript")}</span>
              <textarea
                value={draft ?? excerpt}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setSaved(false);
                }}
              />
            </label>
            <div className="journey-save">
              <button
                className="btn primary small"
                onClick={() => {
                  setPrevious(excerpt);
                  setSaved(true);
                }}
              >
                {saved ? <Check size={16} /> : null}
                {t("previewSave")}
              </button>
              <span role="status">
                {saved ? t("previewSaved") : t("demoLabel")}
              </span>
            </div>
            {history && (
              <div className="journey-history">
                <strong>{t("previewVersion")}</strong>
                <p>{previous ?? excerpt}</p>
                <button
                  className="text-link"
                  onClick={() => {
                    setDraft(previous ?? excerpt);
                    setSaved(false);
                    setHistory(false);
                  }}
                >
                  {t("previewRestore")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Link className="journey-footer" to="/demo">
        {t("demo")}
        <ArrowUpRight size={17} />
      </Link>
    </div>
  );
}
