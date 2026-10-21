# Arsenal development

Keep the product local-first. Do not add paid model APIs, telemetry, cloud sync,
authentication or public hosting without explicit approval. Natural-language search
currently means an explainable local ranker, not an LLM or semantic embedding model.

This public application repository is separate from private package-intake history.
Never commit local paths, intake bodies, screenshots of private chats, source videos,
credentials, customer records or unlicensed third-party source. Review the complete
staged diff before pushing. Reference access is not permission to redistribute it.

Build states must remain truthful: received is not built, built is not human-approved.
Imported files are untrusted data. Do not execute them or let imports control shell
commands, filesystem paths, remote requests, or permissions. Only serve allowlisted
metadata. Keep the server loopback-only and its APIs read-only.

Read design/DESIGN.md before frontend changes. New compositions await explicit concept
selection. Test search, accessibility, failure states, reduced motion and responsive
containment before calling a UI complete. No fixture can prove a real integration.
