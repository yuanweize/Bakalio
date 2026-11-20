# Implementation status — 2026-11-20

Development increment, not a completed commercial release. Earlier reports are historical and do not certify current changes.

| Phase | Current result | Remaining acceptance |
|---|---|---|
| 0 | Preserved interrupted UI work, split pages/styles; Kiri volumes retained; four additive migrations; full isolated database/attachment restore drill | Original legacy E2E coverage is not fully rerun |
| 1 | Text proposal → located requirements → confirmation → generic versioned blueprint → persistent chapter documents; browser E2E passed | AI analysis/planning, file input/OCR, nested/reorder/merge/split interactions |
| 2 | Server adapter, PgBoss tasks, consent, idempotency, token accounting, timeout/cancel and versioned suggestions. Isolated local-provider E2E passed section generation and anchored revision | Real provider queue/restart/quota integration tests and monetary accounting; production remains disabled |
| 3 | Crossref L0/L1, exact-passage L2, version staleness, separate human review, anchored comments and comment-driven revision | L3 semantic support, L4 independent review, robust multi-node anchors and full-text retrieval |
| 4 | Product UI and public four-step labeled demo, template filters, trilingual hero; 36-case responsive matrix | Complete localized task/status copy, accessibility review and richer student dashboard/editor flows |
| 5 | Generic editable DOCX and basic readiness warnings | CSL, school templates, media/table fidelity, complete readiness checks, credits and payments |
| 6 | 17 unit/contract tests; TypeScript/format; workflow, review, public demo, export and eight cross-account access denials; isolated PgBoss E2E; 36 responsive cases; public GitHub CI passed | Full requested 25-scenario suite, production AI and advanced export verification |

## Current evidence

- `artifacts/thesis/report.json`: fictional assignment, requirements, blueprint, six chapters, refresh and editor autosave passed.
- `artifacts/thesis/matrix.json`: 36 cases across 390/768/1440, cs/en/zh, light/dark and landing/workspace; no recorded overflow or page errors. Representative screenshots were opened and reviewed. These checks do not establish full accessibility or editor interaction coverage.
- `artifacts/thesis/live-provider.json`: two authorized synthetic calls to gpt-6-luna, maximum 512 output tokens each. One failed; one passed and explicitly requested missing research data. Successful response reported 164 input / 104 output tokens. Failed-call billing is unknown. This was a direct adapter test, not a PgBoss end-to-end test. No further calls were made.
- `artifacts/thesis/metadata-live.json`: DOI 10.1038/nphys1170 matched L1; fictional DOI returned L0/not_found. No full-text or semantic verification was claimed.
- `artifacts/thesis/ai-queue.json`: two local fixture calls in an isolated schema-only test database proved queue completion, usage, idempotency, explicit acceptance and anchored comment revision. This was not a paid or third-party model test. The test database was deleted after verification; production AI stayed off.
- DOCX unit test inspects actual OOXML headings, citation page, bibliography, TOC and page fields. It is not a rendered Word layout review.

Real accounts, documents and attachments remain on existing volumes. Production AI, payments and public self-service signup remain disabled. SMTP still needs outbound configuration. Private test credentials, provider configuration, backup files and generated artifacts are excluded from Git.

## Verified increment — 2026-11-20

- Deployed 0.2.0 API/web images on Kiri; public `/api/health`, login, proposal-to-chapters E2E and actual DOCX download passed. Canonical points to the public domain; inspected HTML contained no old private API address.
- Backup `backups/20261120-012427` restored into an isolated PostgreSQL container. Database restore and every attachment size check passed. Backup paths/data remain private.
- Subsequent review increment adds durable comments, explicit claims, L2 exact-page passage location, version-staleness checks and separate human decisions. `artifacts/thesis/review.json` passed anchored comment/claim creation, exact passage and invalid-page cases, separate human review, edit invalidation and stale/unauthenticated rejection. It is not L3/L4 AI semantic verification.
- 17 unit/contract tests pass after anchor/replacement additions. Replacement tests preserve rich text and refuse ambiguous or cross-node matches. End-to-end AI revision against a live model remains untested.
- Four-step public example and degree/type/language template filtering passed `e2e/thesis-demo.mjs`. The 36-case screenshot matrix was rerun after these changes; no overflow or page errors were recorded. Some UI status identifiers still need localization; this is not a claim of full translation coverage.
- `e2e/two-account-review.mjs` denied eight cross-account document, project, source, proposal, review and export actions.
- Public repository `yuanweize/Bakalio` was created from a reviewed single-commit history. The original local development history and recoverable bundle remain private. The first clean-checkout GitHub CI run passed Wasp installation, build, typecheck, format check and 17 tests.
- Direct dependencies were updated within Wasp's required manifest ranges. Nodemailer is overridden to a fixed 10.x release and its local Mailpit signup flow passed in an isolated test database. `npm audit --omit=dev` now reports zero high/critical and two moderate advisories (PgBoss and its UUID dependency). Development-only Nodemon dependencies still account for three high advisories; replacing Wasp's pinned queue/dev-tool majors without compatibility testing is pending.
- Rebuilt and restarted the production API with existing named volumes. API/web/DB/Mailpit health checks passed; the public configuration shows registration and AI disabled and no provider hostname. `/en`, `/cs`, `/zh`, `/demo`, `/api/health`, logo, social image, manifest, robots and sitemap returned successfully. The public Chrome four-step demo E2E passed after the restart.
- A follow-up idempotency fix ensures replaying an existing AI request never submits a second PgBoss message. The isolated fixture E2E was rerun after the change and still made exactly two calls for two distinct tasks, including one anchored revision.

Full requested Phase 0–6 acceptance, OCR, school templates, monetary credits/payments and complete export fidelity remain unfinished. This source revision still requires public GitHub CI after pushing; the earlier clean-checkout CI result applies to the previous commit.

## Landing experience refinement — 2026-11-20

Expanded the publicly visible prepared-examples thesis walkthrough into a three-pane studio with a persistent chapter tree, saved-in-tab per-chapter example drafts, comment revision diff and L0 evidence inspector. Added a seven-chapter KPM slide reference with explicit unverified provenance; this is not an official university template or fully integrated project blueprint option. Replaced disabled-signup hero/header links with the public demo unless registration is enabled. TypeScript, 20 unit tests, four-step demo E2E, and trilingual 390/768/1440 layout/interaction checks passed locally. AI execution and billing remain disabled in production.

The updated public Web-only container was deployed using the existing Compose project and volumes; API and database were not recreated. Public /en, /cs, /zh, /demo and /api/health returned 200; the public four-step browser interaction suite passed again after deployment, and the new Web health check became healthy. The Mac still has only about 2.1 GiB free, so avoid unnecessary Docker rebuilds and large artifacts.

A separate public guided route `/demo?view=studio` now leads into the existing `/demo` editor sandbox, without breaking the original sandbox's in-memory-only behavior or public overview/library routes. On the deployed Kiri Web image, `e2e/guided-demo.mjs` passed for all three locales, and `e2e/thesis-demo.mjs` passed again. Production AI, public signup and payments remain disabled.
