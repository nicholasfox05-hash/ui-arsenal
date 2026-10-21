# UI Arsenal

A local-first workbench for discovering, inspecting and reusing UI components.
Describe the interaction you need; find matching references, inspect their provenance,
and distinguish received packages from verified implementations.

**Status: early foundation.** The local search engine and read-only catalog API work.
The application UI is awaiting design selection; this is not yet a finished component gallery.

## Run locally

Node.js 22 or newer. No dependencies, API key or cloud account required for this foundation.

```sh
npm test
npm start
```

The API listens only on `http://127.0.0.1:5337`.

```text
GET /api/health
GET /api/catalog
GET /api/search?q=a%20sidebar%20with%20a%20moving%20indicator
GET /api/components/demo-gliding-sidebar
GET /api/components/demo-gliding-sidebar/related
```

With no private intake configured, clearly labeled sample records demonstrate search.
They are not shipped component implementations. A configured private intake replaces
the sample dataset; an unreadable intake produces an error, never silent demo fallback.

## Search

Search is deterministic and local: normalization, interaction vocabulary, weighted
title/tag/description matching and shared-tag related results. It explains matched
terms. It does not call an LLM, use embeddings, fabricate relevance percentages or
claim a specific AI-provider integration. Queries are not logged or sent elsewhere.
This is a bounded first version: unsupported phrasing may return no results.

## Connect a private package queue

Set `ARSENAL_INTAKE_DIR` in your shell to a directory containing `data/ledger.json`,
then start the app. Use your own local path; never commit it. `.env` files are not
loaded automatically. The adapter exports only approved metadata fields and never
serves package bodies, transport messages, private paths, source media or executable code.

Expected ledger shape:

```json
{"schema_version":1,"active_claim":null,"entries":[{"slug":"example-sidebar","revision":1,"title":"Example sidebar","status":"received","tags":["sidebar","motion"],"source_url":"https://example.com/reference"}]}
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).
Original application code is MIT licensed. External reference material retains its
own copyright and license; this license does not relicense third-party content.

## Roadmap

- Selected library/search interface and responsive inspection panel.
- Saved collections, clear incoming/ready/build status and source attribution.
- Isolated, manually registered implementation previews.
- Source/implementation comparison and evidence-backed review checks.
- Optional richer local search after evaluating accuracy and resource requirements.
