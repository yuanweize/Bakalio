import { ArrowRight, BookOpen } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  login,
  requestPasswordReset,
  resetPassword,
  signup,
  verifyEmail,
} from "wasp/client/auth";
import { getPublicConfig, useQuery } from "wasp/client/operations";
import { Button } from "../client/components/ui/button";
import { PublicHeader } from "./Chrome";
import { useI18n } from "./i18n";
export function AuthPage() {
  const { pathname, search } = useLocation();
  const nav = useNavigate();
  const { t, locale } = useI18n();
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const kind = pathname.slice(1);
  const config = useQuery(getPublicConfig);
  const closed =
    ["signup", "forgot"].includes(kind) && !config.data?.registrationEnabled;
  const title =
    kind === "signup"
      ? "signup"
      : kind === "forgot"
        ? "forgot"
        : kind === "verify"
          ? "verify"
          : kind === "reset"
            ? "reset"
            : "login";
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "");
    try {
      if (kind === "signup") {
        await signup({ email, password, locale });
        setSent(true);
      } else if (kind === "forgot") {
        await requestPasswordReset({ email });
        setSent(true);
      } else if (kind === "verify") {
        await verifyEmail({
          token: new URLSearchParams(search).get("token") || "",
        });
        nav("/login");
      } else if (kind === "reset") {
        await resetPassword({
          token: new URLSearchParams(search).get("token") || "",
          password,
        });
        nav("/login");
      } else {
        await login({ email, password });
        const next = new URLSearchParams(search).get("returnTo");
        nav(
          next && /^\/app(?:\/|$)/.test(next) && !next.includes("\\")
            ? next
            : "/app",
        );
      }
    } catch {
      setError(t("error"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PublicHeader />
      <main className="auth-layout">
        <div className="auth-story">
          <BookOpen size={36} />
          <h1>{t("hero")}</h1>
          <p>{t("heroText")}</p>
        </div>
        <div className="auth-card">
          <h2>{t(title)}</h2>
          {closed ? (
            <div className="notice">
              <h3>{t("signupClosed")}</h3>
              <p>{t("signupClosedText")}</p>
            </div>
          ) : sent ? (
            <p role="status" className="notice">
              {t("checkEmail")}
            </p>
          ) : (
            <form onSubmit={submit} className="stack-form">
              {!["verify", "reset"].includes(kind) && (
                <label>
                  {t("email")}
                  <input
                    name="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    type="email"
                  />
                </label>
              )}
              {!["verify", "forgot"].includes(kind) && (
                <label>
                  {t("password")}
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete={
                      kind === "login" ? "current-password" : "new-password"
                    }
                  />
                </label>
              )}
              {error && (
                <p className="alert" role="alert">
                  {error}
                </p>
              )}
              <Button className="btn primary full" disabled={busy}>
                {busy ? t("loading") : t(title)}
              </Button>
            </form>
          )}
          <div className="auth-links">
            <Link to={kind === "login" ? "/signup" : "/login"}>
              {t(kind === "login" ? "signup" : "login")}
            </Link>
            <Link to="/forgot">{t("forgot")}</Link>
          </div>
          <Link className="text-link" to="/demo">
            {t("demo")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </>
  );
}
