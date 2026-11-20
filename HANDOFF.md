# Handoff

Continue from the current worktree; do not reset or overwrite uncommitted changes. Start with IMPLEMENTATION_STATUS.md and docs/THESIS_WORKFLOW.md. The repository folder is now Bakalio. Docker uses the existing `research-studio` project/volumes for compatibility; do not rename or delete these volumes.

Public URL: https://bakalio.eurun.eu.org/ . Local persistent web/API ports: 4310/4311. Development verification used 4320/4321. Do not start two services on the same ports. Kiri is the current runtime; other services must remain untouched.

AI credentials and the approved local endpoint live only in ignored server configuration. Do not print them. Two synthetic model requests were authorized and consumed; one failed and one passed. Further real calls need a new bounded test authorization. Production AI stays off.

Remaining work is explicitly listed by phase in IMPLEMENTATION_STATUS.md. Do not describe generic blueprints as AI output, metadata matching as claim verification, or current DOCX as university-certified formatting. Original private history is preserved locally; public history requires separate secret/private-information review.
