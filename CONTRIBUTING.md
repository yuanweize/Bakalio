# Contributing

Read README.md, ARCHITECTURE.md and app/AGENTS.md first. Use the pinned Wasp version and existing PostgreSQL/PgBoss stack. Keep changes focused and describe their user-visible behavior and validation.

Run `npm run typecheck`, `npm test` and `npm run lint` in app after compiling Wasp. Add meaningful tests for ownership, persistence, schema changes and AI accounting. Test interface changes with installed Chrome at phone, tablet and desktop sizes, in supported locales and both themes.

Do not commit secrets, uploaded work, test credentials, database files or private screenshots. Use fictional fixtures. Never present demo output as real AI or metadata checks as proof of a claim. Include additive migrations and rollback notes for data changes; never reset a user's database.
