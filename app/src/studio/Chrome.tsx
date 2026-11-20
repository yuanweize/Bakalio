import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  BookOpen,
  ChartNoAxesColumn,
  ChevronRight,
  FlaskConical,
  Folder,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Wallet,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { getPublicConfig, useQuery } from "wasp/client/operations";
import { logout, useAuth } from "wasp/client/auth";
import { brand } from "./brand";
import { useI18n, type Key, type Locale } from "./i18n";
export function Logo() {
  return (
    <Link className="logo" to="/">
      <span className="brand-mark">
        <img src="/brand/symbol.svg" alt="" width="37" height="38" />
      </span>
      {brand.name}
    </Link>
  );
}

export function PreferencesControls() {
  const { locale, setLocale, theme, setTheme, t } = useI18n();
  return (
    <div className="preferences">
      <select
        aria-label={t("interfaceLanguage")}
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
      >
        <option value="cs">Čeština</option>
        <option value="en">English</option>
        <option value="zh">简体中文</option>
      </select>
      <button
        aria-label={t("theme")}
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    </div>
  );
}

export function PublicHeader() {
  const { t, locale } = useI18n();
  const config = useQuery(getPublicConfig);
  const registrationOpen = config.data?.registrationEnabled === true;
  const [open, setOpen] = useState(false);
  return (
    <header className="public-header">
      <Logo />
      <nav className={open ? "open" : ""}>
        {(["features", "workflow", "pricing"] as Key[]).map((k) => (
          <Link key={k} to={`/${locale}/${k}`} onClick={() => setOpen(false)}>
            {t(k)}
          </Link>
        ))}
      </nav>
      <div className="header-right">
        <PreferencesControls />
        <Link className="login-link" to="/login">
          {t("login")}
        </Link>
        <Link
          className="btn primary small"
          to={registrationOpen ? "/signup" : "/demo"}
        >
          {t(registrationOpen ? "signup" : "demo")}
          <ArrowUpRight size={16} />
        </Link>
        <button
          className="menu-button"
          aria-label={t("menu")}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  const { t, locale } = useI18n();
  return (
    <footer>
      <div>
        <Logo />
        <p>{t("heroText")}</p>
        <span className="fine-print">
          © {new Date().getFullYear()} {brand.name} · {t("beta")}
        </span>
      </div>
      <nav>
        {(
          [
            "features",
            "workflow",
            "pricing",
            "faq",
            "support",
            "privacy",
            "terms",
          ] as Key[]
        ).map((k) => (
          <Link key={k} to={`/${locale}/${k}`}>
            {t(k)}
          </Link>
        ))}
      </nav>
    </footer>
  );
}

export function SEO() {
  const { locale, t } = useI18n();
  const { pathname } = useLocation();
  return (
    <>
      <title>{`${brand.name} — ${t("hero")}`}</title>
      <meta name="description" content={t("heroText")} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={`${brand.name} — ${t("hero")}`} />
      <meta property="og:description" content={t("heroText")} />
      <meta
        property="og:url"
        content={brand.url + (pathname === "/" ? "/cs" : pathname)}
      />
      <meta property="og:image" content={brand.url + "/brand/social.png"} />
      <meta name="twitter:card" content="summary_large_image" />
      <link
        rel="canonical"
        href={brand.url + (pathname === "/" ? "/cs" : pathname)}
      />
      {(["cs", "en", "zh"] as const).map((l) => (
        <link
          key={l}
          rel="alternate"
          hrefLang={l === "zh" ? "zh-Hans" : l}
          href={
            brand.url +
            "/" +
            l +
            (pathname.split("/").slice(2).length
              ? "/" + pathname.split("/").slice(2).join("/")
              : "")
          }
        />
      ))}
    </>
  );
}

export function AppFrame({
  children,
  demo = false,
}: {
  children: ReactNode;
  demo?: boolean;
}) {
  const { t } = useI18n();
  const { data: user } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname, search } = useLocation();
  const demoView = new URLSearchParams(search).get("view");
  return (
    <div className="app-frame">
      <aside className={"app-sidebar " + (open ? "open" : "")}>
        <Logo />
        <div className="workspace-label">
          {demo ? t("demoLabel") : t("account")}
          <span>{demo ? brand.name : user?.email}</span>
        </div>
        <nav>
          {[
            [LayoutDashboard, "overview", "/app"],
            [Folder, "projects", "/app/projects"],
            [BookOpen, "library", "/app/library"],
          ].map(([Icon, k, url]: any) => (
            <Link
              key={k}
              className={
                (demo ? demoView === k : pathname === url) ? "selected" : ""
              }
              to={demo ? "/demo?view=" + k : url}
            >
              <Icon size={19} />
              {t(k)}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <nav>
            {[
              [Settings, "settings"],
              [ChartNoAxesColumn, "usage"],
              [Wallet, "billing"],
            ].map(([Icon, k]: any) => (
              <Link key={k} to={demo ? "/signup" : "/app/" + k}>
                <Icon size={18} />
                {t(k)}
              </Link>
            ))}
          </nav>
          <div className="sidebar-note">
            <FlaskConical size={18} />
            <span>{t("beta")}</span>
          </div>
          {!demo && (
            <button onClick={() => void logout()}>
              <LogOut size={17} />
              {t("logout")}
            </button>
          )}
        </div>
      </aside>
      <div className="app-body">
        <header className="app-topbar">
          <button
            className="menu-button"
            aria-label={t("menu")}
            onClick={() => setOpen(!open)}
          >
            <Menu size={20} />
          </button>
          <span>
            {brand.name} <ChevronRight size={14} />{" "}
            {demo ? t("demoLabel") : t("overview")}
          </span>
          <PreferencesControls />
          <Link className="avatar" to={demo ? "/signup" : "/app/settings"}>
            {demo ? brand.mark : user?.email?.slice(0, 2).toUpperCase()}
          </Link>
        </header>
        {children}
      </div>
    </div>
  );
}

export function Modal({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-content" aria-describedby={undefined}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Close className="modal-close" aria-label={t("close")}>
            <X size={20} />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function WorkspaceShortcuts({ demo = false }: { demo?: boolean }) {
  const { t } = useI18n();
  return (
    <div className="workspace-shortcuts">
      <Link to={demo ? "/demo?view=library" : "/app/library"}>
        <div className="shortcut-icon">
          <BookOpen size={23} />
        </div>
        <div>
          <h3>{t("library")}</h3>
          <p>{t("sourceShortcut")}</p>
        </div>
        <ArrowUpRight size={20} />
      </Link>
      <Link to={demo ? "/demo?view=projects" : "/app/projects"}>
        <div className="shortcut-icon">
          <Folder size={23} />
        </div>
        <div>
          <h3>{t("projects")}</h3>
          <p>{t("projectShortcut")}</p>
        </div>
        <ArrowUpRight size={20} />
      </Link>
    </div>
  );
}
