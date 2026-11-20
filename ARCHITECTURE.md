# Architecture

Bakalio extends Open SaaS / Wasp 0.26.1, React, TypeScript, Prisma/PostgreSQL and Tiptap. Wasp owns generated auth, API operations, Prisma client and PgBoss. Generated `.wasp` output is never manually edited. No second queue, SaaS framework or vector database is introduced.

`studio/` contains shared chrome, marketing, auth, workspace, the Tiptap editor and thesis workflow UI. `thesis/workflow.ts` contains validation, deterministic requirement extraction, generic blueprints and legal section transitions. `server/operations.ts` is the authenticated boundary; `thesis.ts`, `aiTasks.ts`, `metadata.ts` and `export.ts` implement business concerns. `ai/live.ts` contains the server-compatible bounded adapter; `ai/provider.ts` retains the clearly labelled demo adapter.

Project membership gates project/document operations. Source ownership gates files and metadata. Document mutations use optimistic versions and transactional revision snapshots. Blueprint versions and source-verification events preserve provenance. See [workflow, invariants, verification levels and quotas](docs/THESIS_WORKFLOW.md).

PostgreSQL and private file volumes remain separate. nginx serves prerendered public pages and forwards `/api/` to Wasp. API and web retain the existing listening ports; database and Mailpit remain loopback-only. Production self-service signup is gated until outbound email is configured.

Live AI remains disabled by default. Keys are server-only; no request body/prompt logging is introduced. Source instructions cannot grant tool access. Current generation sends only the explicitly consented assignment and section context; it does not read arbitrary files or browse URLs. Independent evidence review, robust comment anchors and privacy erasure workflows remain unfinished.
