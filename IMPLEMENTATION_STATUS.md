# Implementation status — 2026-11-19

Development increment, not a completed commercial release. Earlier reports are historical and do not certify current changes.

| Phase | Current result | Remaining acceptance |
|---|---|---|
| 0 | Preserved interrupted UI work, split pages/styles; TypeScript/build checks; Kiri volumes retained; additive migration and readable database archive | New full restore drill; all original security E2Es rerun |
| 1 | Text proposal → located requirements → confirmation → generic versioned blueprint → persistent chapter documents; browser E2E passed | AI analysis/planning, file input/OCR, nested/reorder/merge/split interactions |
| 2 | Compatible server adapter, PgBoss tasks, conservative token reservation, consent, idempotency, timeout/cancel, suggestion acceptance with version checks | Full queue/restart/quota integration tests and monetary accounting; production remains disabled |
| 3 | Live Crossref metadata matching, explicit L0/L1 and append-only source-version events | Atomic claims, L2–L4, human review, anchored comments and comment-to-revision |
| 4 | Inherited landing/workspace redesign integrated; trilingual proposal UI and 36-case responsive matrix | Four-step public thesis demo, templates explorer, complete localized task/status copy and accessibility review |
| 5 | Generic editable DOCX and basic readiness warnings | CSL, school templates, media/table fidelity, complete readiness checks, credits and payments |
| 6 | 14 current unit/contract tests; TypeScript; workflow browser E2E; 36 landing/workspace width/locale/theme checks | Full requested 25-scenario suite and production verification |

## Current evidence

- `artifacts/thesis/report.json`: fictional assignment, requirements, blueprint, six chapters, refresh and editor autosave passed.
- `artifacts/thesis/matrix.json`: 36 cases across 390/768/1440, cs/en/zh, light/dark and landing/workspace; no recorded overflow or page errors. Representative screenshots were opened and reviewed. These checks do not establish full accessibility or editor interaction coverage.
- `artifacts/thesis/live-provider.json`: two authorized synthetic calls to gpt-6-luna, maximum 512 output tokens each. One failed; one passed and explicitly requested missing research data. Successful response reported 164 input / 104 output tokens. Failed-call billing is unknown. This was a direct adapter test, not a PgBoss end-to-end test. No further calls were made.
- `artifacts/thesis/metadata-live.json`: DOI 10.1038/nphys1170 matched L1; fictional DOI returned L0/not_found. No full-text or semantic verification was claimed.
- DOCX unit test inspects actual OOXML headings, citation page, bibliography, TOC and page fields. It is not a rendered Word layout review.

Real accounts, documents and attachments remain on existing volumes. Production AI, payments and public self-service signup remain disabled. SMTP still needs outbound configuration. Private test credentials, provider configuration, backup files and generated artifacts are excluded from Git.

## Verified increment — 2026-11-20

- Deployed 0.2.0 API/web images on Kiri; public `/api/health`, login, proposal-to-chapters E2E and actual DOCX download passed. Canonical points to the public domain; inspected HTML contained no old private API address.
- Backup `backups/20261120-012427` restored into an isolated PostgreSQL container. Database restore and every attachment size check passed. Backup paths/data remain private.
- Subsequent review increment adds durable comments, explicit claims, L2 exact-page passage location, version-staleness checks and separate human decisions. `artifacts/thesis/review.json` passed anchored comment/claim creation, exact passage and invalid-page cases, separate human review, edit invalidation and stale/unauthenticated rejection. It is not L3/L4 AI semantic verification.
- 17 unit/contract tests pass after anchor/replacement additions. Replacement tests preserve rich text and refuse ambiguous or cross-node matches. End-to-end AI revision against a live model remains untested.
- Four-step public example and degree/type/language template filtering passed `e2e/thesis-demo.mjs`. The 36-case screenshot matrix was rerun after these changes; no overflow or page errors were recorded. Some UI status identifiers still need localization; this is not a claim of full translation coverage.

These later source changes require a new build/deploy before they can be called publicly verified. Full requested Phase 0–6 acceptance, OCR, school templates, monetary credits/payments and complete export fidelity remain unfinished.
