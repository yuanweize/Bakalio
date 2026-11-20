# Thesis workflow and execution boundaries

## Persistent workflow

`Project` remains the ownership root. `Proposal` stores original assignment text, located requirements, a revision counter and confirmation time. Explicit matches carry the exact quote and character offset. Missing information is never inferred. Confirming requirements creates a new `Blueprint` version with a pinned proposal version. Blueprint approval creates `ThesisSection` records and existing-style `Document` records atomically. Editing the blueprint preserves all written documents, including chapters removed from the active structure.

Blueprint dependencies must reference preceding stable keys; duplicate keys and cycles are rejected. A stale proposal cannot approve an old blueprint. Writes use optimistic versions, and blueprint creation uses serializable transactions.

Sections move through not_started → ready → draft → needs_review → evidence_review → approved, with revision_requested, blocked, failed and needs_human_input branches. AI alone can enter generating. Editing or restoring a manuscript returns the associated section to draft. Approval is a workflow decision, not factual certification.

Current gaps: nested chapters, drag-and-drop, merge/split, file-to-proposal OCR/DOCX ingestion, and AI-generated blueprint plans.

## AI execution

The compatible provider accepts JSON output and reports usage. Enabling it requires a server-only key, explicit `AI_ENABLED=true`, endpoint/model and positive daily token budget. Default budget is zero. An exact `AI_ALLOWED_HTTP_ORIGIN` can permit a specifically approved local HTTP endpoint; public endpoints require HTTPS. Redirects are rejected.

`AIJob` stores input snapshot, section/document versions, prompt version, provider/model, state, output, usage, reservation and cancellation request. A serializable transaction reserves a conservative UTF-8 input bound plus output limit before PgBoss enqueue. One queued/running task per user. Idempotency is scoped to user and key. Retries do not occur automatically after an ambiguous provider failure; its reservation remains held because it may have been billed upstream.

The worker uses a 60-second timeout and polls cancellation. Refreshing preserves the task/result. Interrupted jobs can be marked for human review after two minutes rather than silently replayed. Queue-submit failure, process-kill recovery and quota races still require full integration acceptance. Token accounting is implemented; monetary pricing, credit products, refunds and merchant billing are not.

Generation produces a suggestion, never an automatic document overwrite. Acceptance checks the original document version and writes the previous revision transactionally. Rejection and acceptance are recorded. Source files are not included in the current section-generation context. Results sections are blocked until research-data review exists. The model prompt alone is not a guarantee against hallucination.

## Evidence levels

- L0: unverified, absent in the queried registry, or metadata mismatch.
- L1: exact DOI, normalized title and author-family names matched in Crossref. Metadata may itself contain errors.
- L2: original text located. Not implemented by the metadata checker.
- L3: semantic claim support assessed. Not implemented.
- L4: independent model review. Not implemented, and would not guarantee correctness.
- Human confirmed: separate version-bound review. Not yet implemented.

`VerificationEvent` is append-only through the application API: source ID/version, actor, method, outcome, level, metadata and timestamp. Source changes increment the version; previous checks display stale. A Crossref 404 means absent from Crossref, not proof that a publication does not exist. Only the DOI is transmitted; metadata is compared locally. No abstract or full text is copied from Crossref.

## Export

Generic DOCX includes title, headings, table-of-contents field, body paragraphs/basic emphasis, citation metadata, bibliography and page number field. Update fields in Word. Warning checks detect empty chapters, missing citations and explicit placeholders. This is not a complete readiness review, CSL renderer, official university template or full-fidelity export of embedded media/tables. PDF/LaTeX remain future work.

## Data migration

Three additive migrations introduce Proposal/Blueprint/ThesisSection, extend AIJob, and add VerificationEvent. Existing project/document/source IDs and named volumes remain unchanged. The pre-migration database archive was readable using pg_restore --list; a new full restore drill has not yet been performed. Rolling the app back can leave the additive tables/columns in place; do not delete volumes or run reset.

## Review increment — 2026-11-20

Comments persist with author, document version and exact selected quote. After edits, an exact unique match can be relocated; duplicate matches are ambiguous and deleted quotes become orphaned. Cross-node AI replacements deliberately require manual handling rather than silently damaging rich text.

Claims are explicitly selected by the user. Exact passage checks record page, quote, source version and SHA-256 of the extracted page text. L2 means that the exact passage exists on that extracted PDF page; it does not imply semantic support. Missing pages/quotes remain L0. Editing a document, claim or source makes previous assessments stale. Human judgments are separate ReviewEvent records, bound to assessment/document/source versions; supported cannot be recorded when the passage was not found.

Comment-driven AI revision uses the existing queue and consent gate. Results return only the replacement text, remain suggestions, and require explicit acceptance. Acceptance checks both document and comment versions, preserves rich-text marks and unrelated paragraphs for a unique single-text-node quote, stores the previous document revision and appends an audit event. Complex anchors require manual editing. No additional paid calls were made to validate this increment; pure replacement tests and persistent comment/evidence E2Es were run.

Four generic template structures now have a public degree/research-type/writing-language explorer. They are not official university formats. The public four-step demo uses prepared output and says so beside the controls.
