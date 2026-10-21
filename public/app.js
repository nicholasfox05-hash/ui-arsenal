import { examples } from "/examples.js";
import { search } from "/search-engine.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const paths = {
  logo: "M5 20 12 4l7 16M8 14h8",
  search: "m21 21-4.4-4.4M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0",
  sun: "M12 3v1m0 16v1M3 12h1m16 0h1M5.6 5.6l.7.7m11.4 11.4.7.7m0-12.8-.7.7M6.3 17.7l-.7.7M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  moon: "M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  left: "M19 12H5m5-5-5 5 5 5",
  up: "M12 19V5m-5 5 5-5 5 5",
  chevron: "m9 5 7 7-7 7",
  close: "m6 6 12 12M6 18 18 6",
  check: "m5 12 4 4L19 6",
  copy: "M9 9h11v12H9zM5 15H3V3h12v2",
  bookmark: "M6 3h12v18l-6-4-6 4Z",
  code: "m8 7-5 5 5 5m8-10 5 5-5 5m-3-12-2 20",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  box: "m3 7 9-4 9 4v10l-9 4-9-4Zm0 0 9 5 9-5M12 12v9M7 5l10 5",
  book: "M12 5v16M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2Z",
  info: "M12 11v6m0-10v.1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  menu: "M4 6h16M4 12h16M4 18h16",
  refresh: "M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 1M5 17a8 8 0 0 0 13 1",
  github:
    "M9 19c-4 1-4-2-6-2m12 5v-4a3.5 3.5 0 0 0-1-2.7c3.3-.4 6.7-1.6 6.7-7.3a5.7 5.7 0 0 0-1.6-4 5.2 5.2 0 0 0-.1-4s-1.2-.4-4 1.5a14 14 0 0 0-7 0C5.2-.4 4 .1 4 .1a5.2 5.2 0 0 0-.1 4 5.7 5.7 0 0 0-1.6 4c0 5.7 3.4 7 6.7 7.3A3.5 3.5 0 0 0 8 18v4",
  external: "M14 3h7v7m0-7L10 14M10 3H3v18h18v-7",
  folder: "M3 6h6l2 2h10v12H3Z",
  spinner: "M21 12a9 9 0 1 1-9-9",
};
const icon = (name, cls = "") =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.box}"/></svg>`;
const repo = "https://github.com/nicholasfox05-hash/ui-arsenal";
const link = (url, label, cls = "") =>
  `<a href="${esc(url)}" class="${cls}" ${url.startsWith("https:") ? 'target="_blank" rel="noopener noreferrer"' : "data-route"}>${label}</a>`;
const navItems = [
  ["/", "Home"],
  ["/docs", "Docs"],
  ["/components", "Components"],
  ["/collections", "Collections"],
  ["/incoming", "Incoming"],
];
let catalog = [],
  catalogMode = "loading",
  catalogError = "",
  loadedAt = null,
  toastTimer,
  searchIndex = 0;
let saved = new Set();
try {
  const raw = JSON.parse(localStorage.getItem("arsenal-saved") || "[]");
  if (Array.isArray(raw))
    saved = new Set(raw.filter((x) => typeof x === "string").slice(0, 1000));
} catch {
  /* In-memory bookmarks still work. */
}
const exampleRecords = examples.map((x) => ({
  ...x,
  summary: x.description,
  status: "example",
  kind: "example",
}));
const currentPath = () => location.pathname;
const current = (path) => (currentPath() === path ? 'aria-current="page"' : "");
const fmtStatus = (status) =>
  ({
    "in-progress": "In progress",
    "needs-info": "Needs info",
    reference: "Reference",
    received: "Received",
    ready: "Ready",
    built: "Build recorded",
    example: "Live example",
  })[status] || status;
const badge = (text) => `<span class="badge">${esc(text)}</span>`;
const bookmark = (id, title) =>
  `<button class="icon-button" data-save="${esc(id)}" aria-label="${saved.has(id) ? "Unsave" : "Save"} ${esc(title)}" aria-pressed="${saved.has(id)}">${icon("bookmark", saved.has(id) ? "saved-icon" : "")}</button>`;
const notice = (text) =>
  `<div class="notice">${icon("info")}<div>${text}</div></div>`;
const empty = (title, description, action = "") =>
  `<div class="empty">${icon("search")}<h2>${title}</h2><p>${description}</p>${action}</div>`;

function renderHeader() {
  $("#header").innerHTML =
    `<div class="header-inner"><button class="icon-button mobile-menu-button" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-nav" data-mobile-menu>${icon("menu")}</button>${link("/", `${icon("logo")}<span>arsenal</span>`, "brand")}<nav class="top-nav" aria-label="Main">${navItems.map(([url, title]) => `<a href="${url}" data-route ${current(url)}>${title}</a>`).join("")}</nav><div class="header-actions"><button class="search-trigger" data-search aria-label="Search Arsenal">${icon("search")}<span>Search the library...</span><kbd>⌘ K</kbd></button>${link(repo, icon("github"), "icon-button github-link")}<button class="icon-button" data-theme aria-label="Toggle theme">${icon(document.documentElement.dataset.theme === "dark" ? "sun" : "moon")}</button>${link("/components", "Browse components", "button primary sm")}</div></div><nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation">${navItems.map(([url, title]) => `<a href="${url}" data-route ${current(url)}>${title}</a>`).join("")}<div class="mobile-section">Components</div>${examples.map((x) => link(`/docs/${x.id}`, x.title)).join("")}</nav>`;
  $(".github-link").setAttribute("aria-label", "Arsenal on GitHub");
  $(".brand").setAttribute("aria-label", "Arsenal home");
  if (!/Mac|iPhone|iPad/.test(navigator.platform))
    $$("kbd", $("#header")).forEach((x) => {
      if (x.textContent === "⌘ K") x.textContent = "Ctrl K";
    });
  $("#footer").innerHTML =
    `<span>Thoughtful interfaces. Yours to make.</span><span>Local-first · Original code <a href="${repo}/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT licensed</a> · Design inspired by <a href="https://ui.shadcn.com/" target="_blank" rel="noopener noreferrer">shadcn/ui</a></span>`;
}
function sideNav() {
  return `<aside class="side-nav" aria-label="Library navigation"><div class="side-group"><h2>Getting started</h2>${[
    ["/docs", "Introduction"],
    ["/components", "All components"],
    ["/collections", "Saved collection"],
    ["/incoming", "Incoming packages"],
  ]
    .map(
      ([url, title]) =>
        `<a href="${url}" data-route ${current(url)}>${title}</a>`,
    )
    .join("")}</div><div class="side-group"><h2>Components</h2>${[...examples]
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(
      (x) =>
        `<a href="/docs/${x.id}" data-route ${current(`/docs/${x.id}`)}>${x.title}</a>`,
    )
    .join(
      "",
    )}</div><div class="side-group"><h2>Resources</h2>${link(repo, `Source code ${icon("external")}`)}${link("/docs#packages", "Package workflow")}</div></aside>`;
}
const shell = (content) =>
  `<div class="page-shell">${sideNav()}<div class="page-content">${content}</div></div>`;
const exampleMarkup = (id) => examples.find((x) => x.id === id).markup;
function renderHome() {
  $("#main").innerHTML =
    `<section class="hero"><a class="announcement" href="/incoming" data-route><span class="badge">Local-first</span> A home for your next great interface ${icon("arrow")}</a><h1>Your interface starts here.</h1><p>Thoughtful components. Details worth keeping.<br>Find the interaction you need, make it your own, and keep building.</p><div class="row">${link("/components", "Explore components", "button primary")}${link("/docs", `${icon("book")} Read the docs`, "button outline")}</div></section>
  <section class="showcase" aria-label="Interactive component examples">
    <div class="showcase-column"><article class="card stack controls-card"><div class="row wrap"><button class="button primary" data-demo-save>Save changes</button><button class="button secondary" data-demo-dialog>Open dialog</button>${link("/docs/button", "View code", "button outline")}</div><form class="input-icon" data-home-search>${icon("search")}<input aria-label="Find a component" placeholder="Find something worth building..." maxlength="500"></form><label class="sr-only" for="idea">Your idea</label><textarea id="idea" placeholder="Describe that little interaction you can’t stop thinking about..." maxlength="500"></textarea><div class="sample-badges"><span class="badge filled">Open source</span><span class="badge">Local-first</span><span class="badge">Made to be yours</span></div><div class="control-label"><label class="row"><input type="checkbox" checked> A little attention to detail</label></div>${exampleMarkup("switch")}<hr><div class="row between"><span class="small muted">Original interactive examples</span>${link("/docs", `${icon("arrow")}`, "icon-button")}</div></article><article class="card"><div class="card-head"><h3>One step at a time.</h3>${icon("check")}</div>${exampleMarkup("progress")}</article></div>
    <div class="showcase-column"><article class="card"><div class="row between"><h3>A little progress, every day.</h3>${badge("Example")}</div><p class="muted">Good interfaces are built in the details.</p><div class="activity-bars" role="img" aria-label="Illustrative progress chart; not live activity">${"<span></span>".repeat(12)}</div><div class="row between small muted"><span>Keep exploring</span><span>Keep refining</span></div></article><article class="card"><div class="card-head"><h3>Make room for the essentials.</h3>${icon("grid")}</div>${exampleMarkup("tabs")}</article><article class="card"><div class="card-head"><h3>Turn it up. Or down.</h3>${link("/docs/slider", icon("arrow"), "icon-button")}</div>${exampleMarkup("slider")}</article></div>
    <div class="showcase-column"><article class="card"><div class="card-head"><h3>A place for everything.</h3>${icon("folder")}</div><div class="mini-sidebar" aria-label="Example navigation"><button aria-pressed="true" data-mini="Overview">${icon("grid")} Overview <span>01</span></button><button aria-pressed="false" data-mini="Components">${icon("box")} Components <span>02</span></button><button aria-pressed="false" data-mini="Collections">${icon("bookmark")} Collections <span>03</span></button></div><p class="preview-label" id="mini-caption">Overview selected · interactive navigation example</p></article><article class="card sample-chat"><div class="row"><span class="avatar">A</span><div><h3>A good conversation.</h3><span class="small muted">An isolated composer example</span></div></div><div class="bubble">Can we make it feel a little simpler?</div><div class="bubble reply">Less noise. More of what matters.</div><form class="row" data-demo-chat><input aria-label="Example message" placeholder="Write a message..." maxlength="240"><button class="icon-button" aria-label="Add example message">${icon("up")}</button></form></article><article class="card"><div class="card-head"><h3>A few good questions.</h3>${icon("info")}</div>${exampleMarkup("accordion")}</article></div>
  </section><section class="bottom-cta"><h2>The next detail is waiting.</h2><p>Browse the library, or describe what you have in mind.</p><button class="button outline" data-search>${icon("search")} Find an interaction <kbd>⌘ K</kbd></button></section>`;
  document.title = "UI Arsenal — Your interface starts here.";
}
function art(item) {
  const id = item.id;
  if (id === "slider") return '<span class="fake-track"></span>';
  if (id === "button")
    return '<span class="button primary">Continue</span><span class="button outline">Cancel</span>';
  if (id === "input")
    return '<span class="fake-input">Your next great idea</span>';
  if (id === "switch")
    return '<span class="row small">Focus mode <span class="badge filled">On</span></span>';
  if (id === "dialog") return '<span class="button outline">Open dialog</span>';
  if (id === "tabs")
    return '<div class="segmented"><span class="button sm outline">Overview</span><span class="button sm">Activity</span></div>';
  if (id === "progress")
    return '<div class="fake-lines"><span>✓ Find an interaction</span><span>○ Try the live example</span></div>';
  if (id === "accordion")
    return '<div class="fake-lines"><span>How does it work? <b>+</b></span><span>Can I make it mine? <b>+</b></span></div>';
  return `<div class="stack row">${icon("box")}<span class="small muted">Reference package</span></div>`;
}
function itemCard(item) {
  const isExample = item.kind === "example";
  return `<article class="catalog-card">${link(isExample ? `/docs/${item.id}` : `/reference/${encodeURIComponent(item.id)}`, `<div class="catalog-art" aria-hidden="true">${art(item)}</div><div class="catalog-copy"><h2>${esc(item.title)}</h2><p>${esc(item.summary)}</p></div>`)}<div class="catalog-foot"><span class="small muted">${esc(isExample ? item.category : fmtStatus(item.status))}${item.demo ? " · Sample" : ""}</span>${bookmark(item.id, item.title)}</div></article>`;
}
let category = "All";
function renderCatalog(collection = false) {
  const params = new URLSearchParams(location.search);
  const initial = (params.get("q") || "").slice(0, 500);
  category = [
    "All",
    "Actions",
    "Forms",
    "Navigation",
    "Disclosure",
    "Feedback",
  ].includes(params.get("category"))
    ? params.get("category")
    : "All";
  $("#main").innerHTML = shell(
    `<div class="page-intro"><div class="eyebrow">Your library</div><h1>${collection ? "A few worth keeping." : "Components"}</h1><p>${collection ? "Your saved examples and references, in one quiet place. Bookmarks stay in this browser." : "A collection of considered interactions. Try an example, explore its details, and find your next starting point."}</p></div><div class="catalog-toolbar"><div class="input-icon">${icon("search")}<input id="catalog-query" aria-label="Search components" placeholder="Describe an interaction, or search by name..." value="${esc(initial)}" maxlength="500"></div><select id="catalog-status" aria-label="Component type"><option value="all">All types</option><option value="example">Live examples</option><option value="reference">Reference packages</option><option value="received">Received</option><option value="built">Build recorded</option></select></div><div class="filter-pills" role="group" aria-label="Categories">${["All", "Actions", "Forms", "Navigation", "Disclosure", "Feedback"].map((x) => `<button data-category="${x}" aria-pressed="${x === category}">${x}</button>`).join("")}</div><div id="catalog-results" aria-live="polite"></div>`,
  );
  const requestedType = params.get("type");
  if (
    ["all", "example", "reference", "received", "built"].includes(requestedType)
  )
    $("#catalog-status").value = requestedType;
  renderCatalogResults(collection);
  document.title = `${collection ? "Collections" : "Components"} — UI Arsenal`;
}
function renderCatalogResults(collection = currentPath() === "/collections") {
  if (!$("#catalog-results")) return;
  const query = $("#catalog-query").value,
    type = $("#catalog-status").value;
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (type !== "all") params.set("type", type);
  if (category !== "All") params.set("category", category);
  history.replaceState(
    {},
    "",
    `${currentPath()}${params.size ? `?${params}` : ""}`,
  );
  let items = [...exampleRecords, ...catalog];
  if (collection) items = items.filter((x) => saved.has(x.id));
  if (category !== "All") items = items.filter((x) => x.category === category);
  if (type !== "all")
    items = items.filter((x) =>
      type === "reference" ? x.kind !== "example" : x.status === type,
    );
  const results = search(items, query, { limit: 100 });
  const statusLine = catalogError
    ? notice(
        `<strong>Package catalog unavailable.</strong> ${esc(catalogError)} <button data-retry class="button sm outline">Retry</button>`,
      )
    : catalogMode === "loading"
      ? notice("Loading reference packages…")
      : "";
  $("#catalog-results").innerHTML =
    statusLine +
    `<div class="row between small muted" id="result-count"><span>${results.total} ${results.total === 1 ? "result" : "results"}</span><span>${query ? "Local vocabulary search" : "Original examples + references"}</span></div><div class="section-heading"></div>` +
    (results.total
      ? `<div class="catalog-grid">${results.results.map(({ component }) => itemCard(component)).join("")}</div>`
      : empty(
          collection && !query
            ? "Make this space yours."
            : "Nothing here just yet.",
          collection && !query
            ? "Save a component using its bookmark button. It will be waiting here."
            : "Try a broader description, a different category, or clear your filters.",
          collection && !query
            ? link("/components", "Explore components", "button primary")
            : '<button class="button outline" data-clear-filters>Clear filters</button>',
        ));
}
function renderIncoming() {
  $("#main").innerHTML = shell(
    `<div class="page-intro"><div class="eyebrow">From reference to reusable</div><h1>Incoming packages</h1><p>A clear view of what has arrived, what needs attention, and what’s ready for the next step.</p></div>${notice("<strong>Received is not built.</strong> These are read-only reference records. Source media stays private; implementation and review happen separately.")}<div class="section-heading"><h2>${catalogMode === "demo" ? "Sample package records" : "Local intake"}</h2><button class="button outline sm" data-retry>${icon("refresh")} Refresh</button></div>${catalogError ? empty("Couldn’t read the package catalog.", esc(catalogError), '<button class="button outline" data-retry>Try again</button>') : catalogMode === "loading" ? '<div class="loading">Loading package records…</div>' : catalog.length ? `<div class="package-list">${catalog.map((x) => link(`/reference/${encodeURIComponent(x.id)}`, `<div class="package-icon">${icon("box")}</div><div class="package-info"><h2>${esc(x.title)}</h2><p>${esc(x.category)} · ${x.demo ? "Illustrative record" : `Revision ${x.revision}`}</p></div>${badge(fmtStatus(x.status))}${icon("chevron")}`, "package-row")).join("")}</div><p class="small muted" style="">${catalogMode === "demo" ? "No intake configured. These records demonstrate the interface." : "Read-only metadata from your configured local intake."}</p>` : empty("Ready when the next package arrives.", "No packages are recorded in the configured intake.")}<div class="doc-section"><p>${loadedAt ? `Last read ${esc(loadedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }))}. Refresh reads the local file; this page does not claim a background sync.` : ""}</p></div>`,
  );
  document.title = "Incoming — UI Arsenal";
}
function toc(sections) {
  return `<aside class="toc" aria-label="On this page"><strong>On this page</strong>${sections.map(([id, title]) => `<a href="#${id}">${title}</a>`).join("")}<div class="toc-card"><strong>A library that stays yours.</strong><p>Browse locally. Search without API calls. Keep the details worth keeping.</p>${link("/components", "Explore the library", "button primary sm")}</div></aside>`;
}
function renderDocs(id) {
  const item = examples.find((x) => x.id === id);
  if (!item) {
    if (!id) renderIntro();
    else
      $("#main").innerHTML = shell(
        empty(
          "Component not found.",
          "This example isn't in the library.",
          link("/components", "Explore components", "button primary"),
        ),
      );
    return;
  }
  const index = examples.indexOf(item),
    prev = examples[(index + examples.length - 1) % examples.length],
    next = examples[(index + 1) % examples.length];
  $("#main").innerHTML =
    `<div class="page-shell docs-shell">${sideNav()}<article class="doc-content"><div class="doc-heading"><h1>${item.title}</h1><div class="row"><button class="button outline sm" data-copy-page>${icon("copy")}<span>Copy page</span></button>${bookmark(item.id, item.title)}</div></div><p class="doc-description">${item.description}</p><div class="doc-topline"><span>Native HTML</span><small>Original example · MIT licensed</small></div><div class="preview-box"><div class="live-preview">${item.markup}</div><div class="code-panel"><pre><code>${esc(pretty(item.markup))}</code></pre><button class="icon-button copy-code" aria-label="Copy example HTML" data-copy-code="${item.id}">${icon("copy")}</button><button class="button outline sm code-toggle" data-code-toggle aria-expanded="false">View code</button></div></div><section class="doc-section" id="usage"><h2>Usage</h2><p>${item.usage}</p></section><section class="doc-section" id="interaction"><h2>Interaction</h2><p>${item.behavior}</p></section><section class="doc-section" id="accessibility"><h2>Accessibility</h2><p>Use the keyboard to try this example. Controls have accessible names, a visible focus indicator, and a reduced-motion alternative. Check contrast and assistive-technology behavior again when adapting it to your product.</p></section><section class="doc-section" id="source"><h2>Source & reuse</h2><p>The code above is the example’s HTML, not a standalone component package. Its shared styles live in <code>public/styles.css</code> and interaction handlers in <code>public/app.js</code>. Use those together when adapting the example.</p><br>${link(`${repo}/tree/main/public`, `${icon("github")} Open source on GitHub`, "button outline sm")}</section><div class="doc-next">${link(`/docs/${prev.id}`, `${icon("left")} ${prev.title}`)}${link(`/docs/${next.id}`, `${next.title} ${icon("arrow")}`)}</div></article>${toc(
      [
        ["usage", "Usage"],
        ["interaction", "Interaction"],
        ["accessibility", "Accessibility"],
        ["source", "Source & reuse"],
      ],
    )}</div>`;
  document.title = `${item.title} — UI Arsenal`;
}
function pretty(markup) {
  return markup.replace(/></g, ">\n<");
}
function renderIntro() {
  $("#main").innerHTML =
    `<div class="page-shell docs-shell">${sideNav()}<article class="doc-content"><div class="doc-heading"><h1>Introduction</h1><button class="button outline sm" data-copy-page>${icon("copy")}<span>Copy page</span></button></div><p class="doc-description">A home for the interactions you want to build.</p><section class="doc-section" id="start"><h2>Start with a detail.</h2><p>Explore a live example, describe an interaction, or inspect a reference package. Arsenal keeps the visual idea, the source, and the implementation state separate so you always know what you’re looking at.</p><br>${link("/docs/slider", "Try your first component", "button primary")}</section><section class="doc-section" id="search"><h2>Describe what you need.</h2><p>Press <kbd>⌘ K</kbd> or <kbd>Ctrl K</kbd> and try “a navigation rail with a moving indicator.” Search uses a local vocabulary ranker, including common interaction synonyms. No query is sent to a model provider. It is not an LLM or an embedding search.</p></section><section class="doc-section" id="packages"><h2>From reference to implementation.</h2><dl class="metadata"><div><dt>Reference / Received</dt><dd>Idea or package, not reusable code</dd></div><div><dt>Ready / In progress</dt><dd>Queued for implementation</dd></div><div><dt>Needs info</dt><dd>Missing evidence or a decision</dd></div><div><dt>Build recorded</dt><dd>Inspect evidence before reuse</dd></div><div><dt>Live example</dt><dd>Original working demonstration</dd></div></dl><p>Intake status is read-only here. A build record does not imply human approval, and private source media is never served by this application.</p></section><section class="doc-section" id="local"><h2>Private by default.</h2><p>The server listens only on localhost. Saved items and your theme stay in this browser. There are no paid API calls, accounts, telemetry, or cloud storage. Configure a private intake directory to replace the clearly labeled sample records.</p></section><section class="doc-section" id="license"><h2>Yours to make.</h2><p>The original application and examples are MIT licensed. External reference materials retain their original licenses. This visual system follows the shadcn/ui reference you selected; it is an independent application, not an official shadcn product.</p></section></article>${toc(
      [
        ["start", "Getting started"],
        ["search", "Search"],
        ["packages", "Package workflow"],
        ["local", "Local-first"],
        ["license", "License"],
      ],
    )}</div>`;
  document.title = "Introduction — UI Arsenal";
}
function renderReference(id) {
  const item = catalog.find((x) => x.id === id);
  if (!item) {
    $("#main").innerHTML = shell(
      catalogMode === "loading"
        ? '<div class="loading">Loading reference…</div>'
        : empty(
            catalogError ? "Catalog unavailable" : "Reference not found",
            esc(catalogError) ||
              "This reference may no longer be in your configured catalog.",
            link("/incoming", "View incoming", "button outline"),
          ),
    );
    return;
  }
  const source = item.sourceUrl
    ? link(
        item.sourceUrl,
        `Open original reference ${icon("external")}`,
        "button outline",
      )
    : notice("No public source URL is recorded for this item.");
  $("#main").innerHTML =
    `<div class="page-shell docs-shell">${sideNav()}<article class="doc-content"><div class="eyebrow">Reference package ${item.demo ? "· Sample record" : ""}</div><div class="doc-heading"><h1>${esc(item.title)}</h1>${bookmark(item.id, item.title)}</div><p class="doc-description">${esc(item.summary)}</p><div class="preview-box"><div class="live-preview stack">${icon("box")}<h3>Reference only. Not a live preview.</h3><p class="muted small">Private source media is not served here.</p>${badge(fmtStatus(item.status))}</div></div><section class="doc-section" id="details"><h2>Package details</h2><dl class="metadata"><div><dt>Category</dt><dd>${esc(item.category)}</dd></div><div><dt>Revision</dt><dd>${item.demo ? "Sample" : item.revision}</dd></div><div><dt>Status</dt><dd>${esc(fmtStatus(item.status))}</dd></div><div><dt>Reusable implementation</dt><dd>Not available here</dd></div><div><dt>Human approval</dt><dd>Not recorded here</dd></div></dl><div class="row wrap">${item.tags.map(badge).join("")}</div></section><section class="doc-section" id="source"><h2>Original source</h2>${source}<p>Access to a reference does not grant permission to redistribute its assets or source code.</p></section><section class="doc-section" id="next"><h2>What happens next?</h2><p>The reference needs an original or properly licensed implementation, interaction checks, responsive review, and human acceptance before it is treated as reusable. This page cannot change that status.</p></section></article>${toc(
      [
        ["details", "Package details"],
        ["source", "Original source"],
        ["next", "Next step"],
      ],
    )}</div>`;
  document.title = `${item.title} — UI Arsenal`;
}
function render() {
  renderHeader();
  const path = currentPath();
  if (path === "/") renderHome();
  else if (path === "/components" || path === "/collections")
    renderCatalog(path === "/collections");
  else if (path === "/incoming") renderIncoming();
  else if (path.startsWith("/reference/")) {
    let id;
    try {
      id = decodeURIComponent(path.slice(11));
    } catch {
      id = "";
    }
    renderReference(id);
  } else if (path.startsWith("/docs")) renderDocs(path.split("/")[2]);
  else
    $("#main").innerHTML = shell(
      empty(
        "Page not found.",
        "Let’s get you back to the library.",
        link("/", "Go home", "button primary"),
      ),
    );
  wireExampleA11y();
  $$("[data-copy-page]").forEach((x) =>
    x.setAttribute("aria-label", "Copy page"),
  );
  $$("a", $("#main"))
    .filter((x) => !x.textContent.trim() && !x.getAttribute("aria-label"))
    .forEach((x) =>
      x.setAttribute(
        "aria-label",
        x.getAttribute("href") === "/docs/slider"
          ? "Open slider documentation"
          : "Open documentation",
      ),
    );
}
function navigate(href) {
  history.pushState({}, "", href);
  category = "All";
  render();
  $("#main").focus({ preventScroll: true });
  if (location.hash) $(location.hash)?.scrollIntoView();
  else window.scrollTo(0, 0);
}
function notify(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 2800);
}
async function loadCatalog() {
  catalogError = "";
  try {
    const response = await fetch("/api/catalog");
    const data = await response.json();
    if (!response.ok) throw Error(data.error);
    catalog = data.components;
    catalogMode = data.mode;
    loadedAt = new Date();
  } catch (error) {
    catalogError = error.message || "The local server could not be reached.";
    catalogMode = "error";
    catalog = [];
  }
  if (
    ["/incoming"].includes(currentPath()) ||
    currentPath().startsWith("/reference/")
  )
    render();
  else renderCatalogResults();
}
function wireExampleA11y() {
  $$(".tabs-demo").forEach((root, index) => {
    const panel = $("[role=tabpanel]", root);
    panel.id = `demo-panel-${index}`;
    $$("[role=tab]", root).forEach((tab, i) => {
      tab.id = `demo-tab-${index}-${i}`;
      tab.setAttribute("aria-controls", panel.id);
    });
    panel.setAttribute("aria-labelledby", $("[aria-selected=true]", root).id);
  });
}
async function copyText(button, text) {
  try {
    await navigator.clipboard.writeText(text);
    const before = button.innerHTML;
    button.innerHTML = `${icon("check")}${button.classList.contains("icon-button") ? "" : "Copied"}`;
    notify("Copied to clipboard");
    setTimeout(() => {
      if (button.isConnected) button.innerHTML = before;
    }, 1600);
  } catch {
    notify("Clipboard unavailable. Select and copy the visible code instead.");
  }
}
function toggleSaved(id) {
  if (saved.has(id)) saved.delete(id);
  else saved.add(id);
  let persisted = true;
  try {
    localStorage.setItem("arsenal-saved", JSON.stringify([...saved]));
  } catch {
    persisted = false;
  }
  $$("[data-save]")
    .filter((x) => x.dataset.save === id)
    .forEach((button) => {
      const name = button
        .getAttribute("aria-label")
        .replace(/^(Unsave|Save) /, "");
      button.innerHTML = icon("bookmark", saved.has(id) ? "saved-icon" : "");
      button.setAttribute("aria-pressed", saved.has(id));
      button.setAttribute(
        "aria-label",
        `${saved.has(id) ? "Unsave" : "Save"} ${name}`,
      );
    });
  if (currentPath() === "/collections") {
    renderCatalogResults(true);
    $("#catalog-query").focus({ preventScroll: true });
  }
  notify(
    persisted
      ? saved.has(id)
        ? "Saved to your collection"
        : "Removed from your collection"
      : "Saved for this session; browser storage is unavailable.",
  );
}
const searchDialog = $("#search-dialog");
function openSearch() {
  searchDialog.innerHTML = `<div class="command-input">${icon("search")}<input id="command-query" role="combobox" aria-controls="command-results" aria-expanded="true" aria-autocomplete="list" placeholder="Search, or describe an interaction..." aria-label="Search library" maxlength="500" autocomplete="off"><button class="icon-button" data-close-search aria-label="Close search">${icon("close")}</button></div><div class="search-results" id="command-results" role="listbox" aria-label="Search results"></div><div class="command-footer"><span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span><span><kbd>↵</kbd> to open</span><span><kbd>esc</kbd> to close</span></div>`;
  searchDialog.showModal();
  updateSearch();
  $("#command-query").focus();
}
function updateSearch() {
  const query = $("#command-query").value;
  const results = search([...exampleRecords, ...catalog], query, {
    limit: 30,
  }).results;
  let entries = [];
  if (!query.trim())
    entries = navItems.map(([url, title]) => ({
      url,
      title,
      note: "Page",
      icon: "book",
    }));
  entries.push(
    ...results.map(({ component, matches }) => ({
      url:
        component.kind === "example"
          ? `/docs/${component.id}`
          : `/reference/${encodeURIComponent(component.id)}`,
      title: component.title,
      note:
        component.kind === "example" ? "Example" : fmtStatus(component.status),
      icon: component.kind === "example" ? "box" : "folder",
      matches,
    })),
  );
  searchIndex = 0;
  $("#command-results").innerHTML = entries.length
    ? `${!query ? '<div class="command-group">Pages & components</div>' : `<div class="command-group">${entries.length} matches · local vocabulary search</div>`}${entries.map((x, i) => `<a class="command-result" id="search-result-${i}" role="option" aria-selected="${i === 0}" href="${x.url}" data-route>${icon(x.icon)}<span>${esc(x.title)}</span><small>${esc(x.note)}</small></a>`).join("")}`
    : `<div class="empty"><h3>No matches found.</h3><p>Try “slider”, “menu”, or “moving sidebar”.</p></div>`;
  $("#command-query").setAttribute(
    "aria-activedescendant",
    entries.length ? "search-result-0" : "",
  );
}
function selectTab(button) {
  const root = button.closest(".tabs-demo");
  $$("[role=tab]", root).forEach((x) => {
    x.setAttribute("aria-selected", x === button);
    x.tabIndex = x === button ? 0 : -1;
  });
  const content = {
    overview: [
      "A place for the essentials.",
      "Everything you need, nothing you don’t.",
    ],
    activity: [
      "Every small step counts.",
      "Your recent activity would feel at home here.",
    ],
    settings: [
      "Make a little room for you.",
      "A focused place for the preferences that matter.",
    ],
  }[button.dataset.demoTab];
  const panel = $("[role=tabpanel]", root);
  panel.setAttribute("aria-labelledby", button.id);
  panel.innerHTML = `<h3>${content[0]}</h3><p class="muted">${content[1]}</p>`;
}
function openDemoDialog() {
  const dialog = $("#demo-dialog");
  dialog.innerHTML = `<form method="dialog" class="dialog-body" id="example-dialog-form"><h2 id="dialog-title">A new beginning.</h2><p>Give your example a name. This is a local interaction demo; nothing is created on a server.</p><label for="demo-name">Project name</label><input id="demo-name" placeholder="Something worth building" maxlength="120" required><div class="row"><button type="button" class="button outline" data-close-demo>Cancel</button><button class="button primary" value="save">Save example</button></div></form>`;
  dialog.showModal();
}
document.addEventListener("click", async (event) => {
  const target = event.target.closest("button,a");
  if (!target) return;
  if (
    target.matches("a[data-route]") &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    event.button === 0
  ) {
    event.preventDefault();
    if (searchDialog.open) searchDialog.close();
    navigate(target.getAttribute("href"));
    return;
  }
  if (target.hasAttribute("data-theme")) {
    const theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("arsenal-theme", theme);
    } catch {}
    target.innerHTML = icon(theme === "dark" ? "sun" : "moon");
  }
  if (target.hasAttribute("data-mobile-menu")) {
    const open = $("#mobile-nav").classList.toggle("open");
    target.setAttribute("aria-expanded", open);
    target.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
  }
  if (target.hasAttribute("data-search")) openSearch();
  if (target.hasAttribute("data-close-search")) searchDialog.close();
  if (target.dataset.save) toggleSaved(target.dataset.save);
  if (target.hasAttribute("data-retry")) {
    target.disabled = true;
    target.innerHTML = `${icon("spinner", "spin")} Reading…`;
    await loadCatalog();
    if (target.isConnected) {
      target.disabled = false;
      target.innerHTML = `${icon("refresh")} Refresh`;
    }
  }
  if (target.dataset.category) {
    category = target.dataset.category;
    $$("[data-category]").forEach((x) =>
      x.setAttribute("aria-pressed", x === target),
    );
    renderCatalogResults();
  }
  if (target.hasAttribute("data-clear-filters")) {
    category = "All";
    $("#catalog-query").value = "";
    $("#catalog-status").value = "all";
    $$("[data-category]").forEach((x) =>
      x.setAttribute("aria-pressed", x.dataset.category === "All"),
    );
    renderCatalogResults();
  }
  if (target.hasAttribute("data-code-toggle")) {
    const expanded = target.closest(".code-panel").classList.toggle("expanded");
    target.setAttribute("aria-expanded", expanded);
    target.textContent = expanded ? "Hide code" : "View code";
  }
  if (target.dataset.copyCode)
    await copyText(
      target,
      pretty(examples.find((x) => x.id === target.dataset.copyCode).markup),
    );
  if (target.hasAttribute("data-copy-page"))
    await copyText(target, $(".doc-content").innerText);
  if (target.hasAttribute("data-demo-save")) {
    target.disabled = true;
    target.innerHTML = `${icon("spinner", "spin")} Saving…`;
    setTimeout(() => {
      if (!target.isConnected) return;
      target.innerHTML = `${icon("check")} Saved`;
      notify("Save feedback demo complete. No data was saved.");
      setTimeout(() => {
        if (target.isConnected) {
          target.innerHTML = "Save changes";
          target.disabled = false;
        }
      }, 1400);
    }, 450);
  }
  if (target.hasAttribute("data-demo-dialog")) openDemoDialog();
  if (target.hasAttribute("data-close-demo")) $("#demo-dialog").close();
  if (target.dataset.demoTab) selectTab(target);
  if (target.dataset.mini) {
    $$("[data-mini]").forEach((x) =>
      x.setAttribute("aria-pressed", x === target),
    );
    $("#mini-caption").textContent =
      `${target.dataset.mini} selected · interactive navigation example`;
  }
});
document.addEventListener("input", (event) => {
  const input = event.target;
  if (input.id === "catalog-query") renderCatalogResults();
  if (input.id === "command-query") updateSearch();
  if (input.type === "range")
    input.closest(".slider-demo").querySelector("output").value = input.value;
});
document.addEventListener("change", (event) => {
  if (event.target.id === "catalog-status") renderCatalogResults();
  const progress = event.target.closest(".progress-demo");
  if (progress) {
    const count = $$("input:checked", progress).length;
    $("progress", progress).value = count;
    $("output", progress).value = `${count} of 3`;
  }
});
document.addEventListener("submit", (event) => {
  if (event.target.matches("[data-home-search]")) {
    event.preventDefault();
    navigate(
      `/components?q=${encodeURIComponent($("input", event.target).value)}`,
    );
  }
  if (event.target.matches("[data-demo-chat]")) {
    event.preventDefault();
    const input = $("input", event.target);
    if (!input.value.trim()) return;
    const bubble = document.createElement("div");
    bubble.className = "bubble reply";
    bubble.textContent = input.value;
    event.target.before(bubble);
    input.value = "";
    const bubbles = $$(".bubble", event.target.closest(".sample-chat"));
    if (bubbles.length > 5) bubbles[0].remove();
    notify("Example message added. Nothing was sent.");
  }
  if (event.target.id === "example-dialog-form") {
    notify("Example named. No server project was created.");
  }
});
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if (searchDialog.open) searchDialog.close();
    else openSearch();
  }
  if (event.key === "Escape") {
    $("#mobile-nav")?.classList.remove("open");
    const menu = $("[data-mobile-menu]");
    menu?.setAttribute("aria-expanded", "false");
    menu?.setAttribute("aria-label", "Open navigation");
  }
  if (
    searchDialog.open &&
    ["ArrowDown", "ArrowUp", "Enter"].includes(event.key) &&
    event.target.id === "command-query"
  ) {
    const results = $$(".command-result", searchDialog);
    if (!results.length) return;
    event.preventDefault();
    if (event.key === "Enter") {
      results[searchIndex]?.click();
      return;
    }
    searchIndex =
      (searchIndex + (event.key === "ArrowDown" ? 1 : -1) + results.length) %
      results.length;
    results.forEach((x, i) =>
      x.setAttribute("aria-selected", i === searchIndex),
    );
    $("#command-query").setAttribute(
      "aria-activedescendant",
      results[searchIndex].id,
    );
    results[searchIndex].scrollIntoView({ block: "nearest" });
  }
  if (
    event.target.matches("[data-demo-tab]") &&
    ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
  ) {
    event.preventDefault();
    const tabs = $$("[role=tab]", event.target.closest("[role=tablist]"));
    let index = tabs.indexOf(event.target);
    index =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
            tabs.length;
    selectTab(tabs[index]);
    tabs[index].focus();
  }
});
for (const dialog of $$("dialog"))
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        dialog.close();
    }
  });
window.addEventListener("popstate", () => {
  category = "All";
  render();
});
render();
loadCatalog();
