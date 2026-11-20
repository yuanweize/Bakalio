import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Clock,
  FileText,
  History as HistoryIcon,
  LayoutDashboard,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { contact, getPublicConfig, useQuery } from "wasp/client/operations";
import { Footer, PublicHeader, SEO } from "./Chrome";
import { ProductJourney } from "./ProductJourney";
import { TemplatesExplorer } from "./TemplatesExplorer";
import { ThesisDemo } from "./ThesisDemo";
import { brand } from "./brand";
import { demoFor } from "./demo";
import { useI18n, type Key } from "./i18n";
export function Workflow() {
  const { t } = useI18n();
  return (
    <section className="workflow-section" id="workflow">
      <div className="section-intro">
        <h2>{t("desk")}</h2>
        <p>{t("deskText")}</p>
      </div>
      <div className="workflow-steps">
        {[
          ["collect", "collectText", BookOpen],
          ["outline", "outlineText", LayoutDashboard],
          ["write", "writeText", FileText],
        ].map(([a, b, Icon]: any, i) => (
          <article key={a}>
            <div className="step-line">
              <span>{i + 1}</span>
              <Icon size={24} />
            </div>
            <h3>{t(a)}</h3>
            <p>{t(b)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FAQ() {
  const { t } = useI18n();
  return (
    <section className="faq-section">
      <h2>{t("faq")}</h2>
      <div>
        {[1, 2, 3].map((n) => (
          <details key={n}>
            <summary>
              {t(("q" + n) as Key)}
              <Plus size={19} />
            </summary>
            <p>{t(("a" + n) as Key)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Pricing() {
  const { t } = useI18n();
  return (
    <section className="pricing-section">
      <div>
        <span className="badge">{t("beta")}</span>
        <h2>{t("earlyTitle")}</h2>
        <p>{t("earlyText")}</p>
      </div>
      <div>
        <strong>
          0 <small>€</small>
        </strong>
        <p>{t("noCard")}</p>
        <Link className="btn primary" to="/signup">
          {t("signup")}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

export function StudentScenarios() {
  const { t } = useI18n();
  const [selected, select] = useState(0);
  const scenarios = [
    {
      title: "scenarioSources",
      text: "scenarioSourcesText",
      icon: BookOpen,
      route: "/demo?view=library",
      detail: "collectText",
    },
    {
      title: "scenarioWriting",
      text: "scenarioWritingText",
      icon: FileText,
      route: "/demo",
      detail: "writeText",
    },
    {
      title: "scenarioVersions",
      text: "scenarioVersionsText",
      icon: HistoryIcon,
      route: "/demo",
      detail: "versionStory",
    },
  ] as const;
  const current = scenarios[selected];
  const Icon = current.icon;
  return (
    <section className="student-scenarios">
      <div className="scenario-heading">
        <h2>{t("scenarioHeading")}</h2>
        <p>{t("scenarioIntro")}</p>
      </div>
      <div className="scenario-layout">
        <div
          className="scenario-choices"
          role="tablist"
          aria-label={t("scenarioHeading")}
        >
          {scenarios.map((item, index) => (
            <button
              key={item.title}
              role="tab"
              id={`scenario-tab-${index}`}
              aria-controls="scenario-content"
              aria-selected={index === selected}
              tabIndex={index === selected ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={(e) => {
                if (
                  e.key === "ArrowDown" ||
                  e.key === "ArrowRight" ||
                  e.key === "ArrowUp" ||
                  e.key === "ArrowLeft"
                ) {
                  e.preventDefault();
                  const next =
                    (index +
                      (e.key === "ArrowUp" || e.key === "ArrowLeft" ? 2 : 1)) %
                    3;
                  select(next);
                  document.getElementById(`scenario-tab-${next}`)?.focus();
                }
              }}
            >
              <item.icon size={22} />
              <span>{t(item.title)}</span>
              <ChevronRight size={18} />
            </button>
          ))}
        </div>
        <div
          className="scenario-content"
          role="tabpanel"
          id="scenario-content"
          aria-labelledby={`scenario-tab-${selected}`}
        >
          <div className="scenario-symbol">
            <Icon size={34} />
          </div>
          <h3>{t(current.text)}</h3>
          <p>{t(current.detail)}</p>
          <Link className="text-link" to={current.route}>
            {t("tryScenario")}
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Landing() {
  const { t, locale } = useI18n();
  const config = useQuery(getPublicConfig);
  const registrationOpen = config.data?.registrationEnabled === true;
  const example = demoFor(locale);
  return (
    <>
      <SEO />
      <PublicHeader />
      <main className="landing marketing-page">
        <section className="hero">
          <div className="hero-copy">
            <div className="availability">
              <span />
              {t("audience")}
            </div>
            <h1>{t("hero")}</h1>
            <p>{t("heroText")}</p>
            <div className="hero-actions">
              <Link
                className="btn primary"
                to={registrationOpen ? "/signup" : "/demo?view=studio"}
              >
                {t(registrationOpen ? "signup" : "demo")}
                <ArrowUpRight size={18} />
              </Link>
              <a className="btn secondary" href="#templates">
                {locale === "cs"
                  ? "Prohlédnout osnovy"
                  : locale === "zh"
                    ? "浏览论文模板"
                    : "Browse thesis templates"}
                <ChevronRight size={18} />
              </a>
            </div>
            <p className="fine-print">
              {registrationOpen
                ? t("noCard")
                : locale === "cs"
                  ? "Ukázku můžeš vyzkoušet bez registrace."
                  : locale === "zh"
                    ? "无需注册，即可体验完整交互演示。"
                    : "Try the interactive demo without registering."}
            </p>
          </div>
          <div className="hero-product-composition">
            <div className="margin-note">{t("stageNote")}</div>
            <ThesisDemo />
          </div>
        </section>
        <div className="principles-strip">
          <span>
            <BookOpen size={18} />
            {t("sources")}
          </span>
          <span>
            <FileText size={18} />
            {t("manuscript")}
          </span>
          <span>
            <Clock size={18} />
            {t("versions")}
          </span>
          <span>
            <ShieldCheck size={18} />
            {t("control")}
          </span>
        </div>
        <TemplatesExplorer />
        <StudentScenarios />
        <Workflow />
        <section className="feature-story">
          <div className="evidence-visual">
            <div className="quote-card">
              <span>{t("manuscript")}</span>
              <p>{example.source.chunks[0].text}</p>
              <span className="citation-chip">Novák, 2025, p. 12</span>
            </div>
            <div className="connection-line" />
            <div className="evidence-card">
              <BookOpen />
              <div>
                <strong>{example.source.title}</strong>
                <p>
                  {t("demoLabel")} · {t("page")} 12
                </p>
              </div>
            </div>
          </div>
          <div>
            <span className="small-label">{t("sources")}</span>
            <h2>{t("write")}</h2>
            <p>{t("writeText")}</p>
            <p className="fine-print">{t("a2")}</p>
            <Link to="/demo" className="text-link">
              {t("demo")}
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
        <section className="control-section">
          <ShieldCheck size={36} />
          <div>
            <h2>{t("control")}</h2>
            <p>{t("controlText")}</p>
          </div>
        </section>
        <section className="open-source-section">
          <div>
            <span className="small-label">MIT · GitHub</span>
            <h2>{t("openSourceTitle")}</h2>
            <p>{t("openSourceText")}</p>
          </div>
          <a className="btn secondary" href={brand.repository}>
            {t("viewCode")}
            <ArrowUpRight size={18} />
          </a>
        </section>
        <Pricing />
        <section className="feedback-invite">
          <div>
            <h2>{t("feedbackTitle")}</h2>
            <p>{t("feedbackText")}</p>
          </div>
          <Link className="btn secondary" to={`/${locale}/support`}>
            {t("feedbackAction")}
            <ArrowUpRight size={18} />
          </Link>
        </section>
        <FAQ />
      </main>
      <Footer />
    </>
  );
}

export function Info() {
  const section = useLocation().pathname.split("/")[2];
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <SEO />
      <PublicHeader />
      <main className="info-page">
        {section === "features" || section === "workflow" ? (
          <Workflow />
        ) : section === "pricing" ? (
          <Pricing />
        ) : section === "faq" ? (
          <FAQ />
        ) : section === "support" ? (
          <>
            <h1>{t("support")}</h1>
            <p>{t("supportText")}</p>
            {sent ? (
              <p role="status" className="notice">
                {t("sent")}
              </p>
            ) : (
              <form
                className="stack-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  try {
                    await contact({
                      email: String(f.get("email")),
                      message: String(f.get("message")),
                      website: String(f.get("website") || ""),
                    });
                    setSent(true);
                  } catch {
                    setError(t("error"));
                  }
                }}
              >
                <label>
                  {t("email")}
                  <input name="email" type="email" required maxLength={200} />
                </label>
                <label>
                  {t("message")}
                  <textarea
                    name="message"
                    required
                    minLength={10}
                    maxLength={4000}
                    rows={6}
                  />
                </label>
                <input
                  name="website"
                  className="honeypot"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
                <button className="btn primary">{t("send")}</button>
                {error && <p role="alert">{error}</p>}
              </form>
            )}
          </>
        ) : (
          <>
            <span className="badge">{t("draft")}</span>
            <h1>
              {section === "privacy"
                ? t("privacy")
                : section === "terms"
                  ? t("terms")
                  : t("notFound")}
            </h1>
            <p>
              {section === "privacy"
                ? t("privacyText")
                : section === "terms"
                  ? t("termsText")
                  : ""}
            </p>
            <Link to="/" className="btn secondary">
              {t("back")}
            </Link>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

export function DesignPreview() {
  const { t } = useI18n();
  const [variant, setVariant] = useState("notebook");
  if (!import.meta.env.DEV)
    return (
      <main className="info-page">
        <h1>404</h1>
        <Link to="/">Bakalio</Link>
      </main>
    );
  return (
    <>
      <PublicHeader />
      <main className={`design-preview ${variant}`}>
        <nav aria-label="Design candidates">
          <button
            className="btn secondary"
            onClick={() => setVariant("notebook")}
          >
            A · Open notebook
          </button>
          <button
            className="btn secondary"
            onClick={() => setVariant("console")}
          >
            B · Research console
          </button>
        </nav>
        <section className="candidate">
          <div>
            <span className="small-label">Bakalio / {variant}</span>
            <h1>{t("hero")}</h1>
            <p>{t("heroText")}</p>
            <Link className="btn primary" to="/demo">
              {t("demo")}
            </Link>
          </div>
          <ProductJourney />
        </section>
      </main>
    </>
  );
}
