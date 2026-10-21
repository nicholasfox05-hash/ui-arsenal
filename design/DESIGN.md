# Arsenal visual contract — shadcn selected 2026-10-21

The user selected https://ui.shadcn.com/ as the whole-site reference, superseding
the three concepts below. Match the compact 64px header, Geist typography, monochrome
light/dark themes, centered 48px hero, rounded live-example cards, command search and
three-column documentation layout. Use Arsenal identity and truthful package status.
The implementation gate is satisfied by this explicit reference selection.

Home uses three example columns, two on tablets and one on phones. Docs retain a
1560px reading cap with 240px navigation and 210px contents rail. Catalog expands
to four columns on large desktops. Original MIT examples remain separate from
received packages; no received package gets a fake install or copy-code action.

The following earlier proposal is historical, not current visual authority.

## Job

Find an interaction from a plain-language description, inspect it, understand its
source and build status, and reuse only a verified implementation. Private references
and publicly distributable code must never become indistinguishable.

## Shared proposal

Charcoal work surface, warm-white text, one restrained mint accent, fine separators,
compact outlined icons, legible sans-serif typography, 8px spacing rhythm and control
radii. Productive use of width; bounded copy and dialogs. Direct feedback 120–180ms,
structural movement 180–260ms, instant reduced-motion alternative.

## Displayed concepts — 2026-10-21

1. Library Workbench: gallery browsing + contextual inspector.
2. Search Workspace: ranked result list + large preview and explanation.
3. Comparison Studio: source/implementation comparison + review evidence.

Recommendation: concept 1 as the main library, concept 3 as a focused review mode.
No selection has been recorded yet. Generated source names, licenses, code and
checkmarks are illustrative, not verified facts and must not be copied into app data.

## Required behavior

- Search accepts natural language, exposes why matches appear, and gives a real no-result state.
- Status filters distinguish reference, received, ready, in progress, needs info and built.
- Details preserve the search context. Source, implementation and review are separate tabs.
- Copy succeeds visibly only after clipboard success. Never show unavailable code as installable.
- All menus work by keyboard, Escape restores focus, click targets fit their labels.
- Incoming state is factual; missing credentials or package files never claim synchronization.
- Empty catalog, no matches, load error, loading, selected and reduced-motion states.
- Local saved collections are separate from intake state and can be reset without deleting packages.
- Real-render review at 390, 820, 1440, 1920 and 2560px before UI completion.
