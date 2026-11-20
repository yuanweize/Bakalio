import { z } from "zod";
export function normalizeDoi(value: string) {
  const doi = value
    .trim()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "")
    .toLowerCase();
  if (!/^10\.\d{4,9}\/\S{1,240}$/.test(doi)) throw Error("INVALID_DOI");
  return doi;
}
const normalized = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
export async function verifyMetadata(source: {
  doi: string;
  title: string;
  authors: string;
}) {
  const doi = normalizeDoi(source.doi);
  const response = await fetch(
    "https://api.crossref.org/works/" + encodeURIComponent(doi),
    {
      headers: {
        "User-Agent": "Bakalio/0.2 (metadata verification)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    },
  );
  if (response.status === 404)
    return {
      level: "L0",
      outcome: "not_found",
      method: "crossref-doi-v1",
      metadata: null,
    };
  if (!response.ok) throw Error("METADATA_UNAVAILABLE");
  const body = (await response.json()) as any;
  const entry = z
    .object({
      DOI: z.string(),
      title: z.array(z.string()).min(1),
      author: z
        .array(
          z.object({
            given: z.string().optional(),
            family: z.string().optional(),
          }),
        )
        .optional(),
      "container-title": z.array(z.string()).optional(),
      volume: z.string().optional(),
      issue: z.string().optional(),
      page: z.string().optional(),
      URL: z.string().optional(),
    })
    .parse(body.message);
  const metadata = {
    doi: entry.DOI,
    title: entry.title[0],
    authors:
      entry.author
        ?.map((a) => [a.given, a.family].filter(Boolean).join(" "))
        .join(", ") || "",
    publication: entry["container-title"]?.[0] || "",
    volume: entry.volume || "",
    issue: entry.issue || "",
    pages: entry.page || "",
    url: entry.URL || "",
  };
  const authorMatch =
    !!entry.author?.length &&
    entry.author.every(
      (a) =>
        a.family && normalized(source.authors).includes(normalized(a.family)),
    );
  const matches =
    normalizeDoi(entry.DOI) === doi &&
    normalized(source.title) === normalized(entry.title[0]) &&
    authorMatch;
  return {
    level: matches ? "L1" : "L0",
    outcome: matches ? "metadata_matched" : "metadata_mismatch",
    method: "crossref-doi-v1",
    metadata,
  };
}
