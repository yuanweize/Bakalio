import { useState } from "react";
import { mutateStudio } from "wasp/client/operations";
import { useI18n } from "./i18n";
const copy = {
  en: {
    check: "Check DOI metadata",
    consent:
      "Send this DOI to Crossref for lookup? Only the DOI is transmitted.",
    none: "L0 · Unverified",
    stale: "Stale: source metadata changed",
    scope:
      "Checks DOI, title and author names only. No full text or claim support has been verified.",
    error: "Lookup unavailable or rate limited. Try again later.",
    history: "Verification history",
  },
  cs: {
    check: "Ověřit metadata DOI",
    consent: "Odeslat DOI službě Crossref? Odešle se pouze DOI.",
    none: "L0 · Neověřeno",
    stale: "Zastaralé: metadata zdroje se změnila",
    scope:
      "Kontrola DOI, názvu a jmen autorů. Plný text ani podpora tvrzení nebyly ověřeny.",
    error: "Vyhledávání není dostupné nebo je omezené. Zkus to později.",
    history: "Historie ověřování",
  },
  zh: {
    check: "核对 DOI 元数据",
    consent: "向 Crossref 查询此 DOI？仅发送 DOI。",
    none: "L0 · 未核验",
    stale: "已过期：来源元数据已修改",
    scope: "仅核对 DOI、标题和作者姓名，尚未核验全文或论述支持情况。",
    error: "查询暂不可用或触发限流，请稍后重试。",
    history: "核验历史",
  },
};
export function SourceVerification({
  source,
  refresh,
}: {
  source: any;
  refresh: () => Promise<unknown>;
}) {
  const { locale } = useI18n();
  const c = copy[locale];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const events = source.verificationEvents || [];
  return (
    <div>
      <p>
        {events[0]
          ? events[0].sourceVersion === source.version
            ? `${events[0].level} · ${events[0].outcome}`
            : c.stale
          : c.none}
      </p>
      <p>{c.scope}</p>
      {source.doi && (
        <button
          disabled={busy}
          onClick={async () => {
            if (!confirm(c.consent)) return;
            setBusy(true);
            setError("");
            try {
              await mutateStudio({
                kind: "source.verify",
                id: source.id,
                consent: true,
              });
              await refresh();
            } catch {
              setError(c.error);
            } finally {
              setBusy(false);
            }
          }}
        >
          {c.check}
        </button>
      )}
      {error && <p role="alert">{error}</p>}
      {!!events.length && (
        <details>
          <summary>{c.history}</summary>
          {events.map((e: any) => (
            <div key={e.id}>
              <p>
                {e.level} · {e.outcome} ·{" "}
                {new Date(e.createdAt).toLocaleString(locale)} · {e.method}
              </p>
              <p>{e.details?.title}</p>
              <p>{e.details?.authors}</p>
            </div>
          ))}
        </details>
      )}
    </div>
  );
}
