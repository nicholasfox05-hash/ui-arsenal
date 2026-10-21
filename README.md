# UI Arsenal

A local-first workbench for discovering, inspecting and reusing UI components.
Describe the interaction you need; find matching references, inspect their provenance,
and distinguish received packages from verified implementations.

**Status: working local preview.** The application follows the selected shadcn/ui
whole-site direction: homepage, browsable component library, three-column docs,
keyboard search, saved collection, and read-only incoming packages.

Eight original interactive examples are included: Button, Slider, Input, Switch,
Tabs, Accordion, Dialog, and Progress. They are deliberately separate from received
reference packages. This is not a mirror of shadcn's entire component catalog.

## Run locally

Node.js 22 or newer. No API key or cloud account required. Geist is served locally;
Prettier is a development-only formatter.

```sh
npm ci
npm test
npm start
```

Open **http://127.0.0.1:5337**. The UI and API listen on loopback only.

## Explore

- `/` — reference-inspired homepage with interactive examples.
- `/components` — local vocabulary search, type/category filters, bookmarks.
- `/docs/slider` — live preview, expandable HTML, clipboard feedback, usage details.
- `/collections` — browser-local saved items; no account or cloud storage.
- `/incoming` — factual package status, refresh, and source details.
- `Ctrl K` / `Cmd K` — keyboard search; arrows to select, Enter to open, Escape to close.

The theme follows your OS initially and remembers your manual selection locally.
Example interactions do not create projects, send messages, or save remote data.

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

## Validation

`npm test` runs 13 checks for search, metadata isolation, HTTP access restrictions,
static asset allowlisting, deep links, example records and layout contracts.
`npm run check` checks all application JavaScript syntax. Browser QA covers real
interaction and representative layouts; see [the review record](design/REVIEW-2026-10-21.md).

## Next steps

- Implement and review received packages without mixing them with starter examples.
- Isolated, manually registered package implementation previews.
- Source/implementation comparison and evidence-backed review checks.
- Optional richer local search after evaluating accuracy and resource requirements.

See [third-party notices](THIRD_PARTY_NOTICES.md) for font licensing and visual attribution.
