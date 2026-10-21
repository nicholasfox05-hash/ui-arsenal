import { test } from "node:test";
import assert from "node:assert/strict";
import { request } from "node:http";
import { search, related } from "../lib/search.mjs";
import { fromLedger, demoCatalog } from "../lib/catalog.mjs";
import { createArsenalServer } from "../server/index.mjs";

const example = () => ({
  schema_version: 1,
  entries: [
    {
      slug: "example-sidebar",
      revision: 1,
      title: "Example sidebar",
      status: "received",
      tags: ["sidebar", "motion"],
      source_url: "https://example.com/reference",
      transport_reference: "PRIVATE",
      package_path: "C:/PRIVATE/secret",
      body: "PRIVATE",
      access_token: "PRIVATE",
    },
  ],
});
test("natural-language query finds the matching interaction with explanations", () => {
  const result = search(
    demoCatalog,
    "I need a navigation rail with a moving indicator",
  );
  assert.equal(result.results[0].component.id, "demo-gliding-sidebar");
  assert.ok(result.results[0].matches.some((m) => m.term === "moving"));
});
test("search handles synonyms, punctuation, empty and no-match states", () => {
  assert.equal(
    search(demoCatalog, "resizable data grid").results[0].component.id,
    "demo-fluid-table",
  );
  assert.equal(
    search(demoCatalog, "A CONVERSATION input").results[0].component.id,
    "demo-conversation-composer",
  );
  assert.equal(search(demoCatalog, "").total, 6);
  assert.equal(search(demoCatalog, "zqxwv").total, 0);
  assert.throws(() => search(demoCatalog, "x".repeat(501)));
});
test("filters and bounded limits do not manufacture completed components", () => {
  assert.equal(search(demoCatalog, "", { status: "built" }).total, 0);
  assert.equal(search(demoCatalog, "", { category: "Navigation" }).total, 1);
  assert.equal(search(demoCatalog, "", { limit: 2 }).results.length, 2);
  assert.throws(() => search(demoCatalog, "", { limit: 0 }));
});
test("related components exclude self and explain shared tags", () => {
  const result = related(demoCatalog, "demo-gliding-sidebar");
  assert.ok(result.length > 0);
  assert.ok(result.every((x) => x.component.id !== "demo-gliding-sidebar"));
  assert.deepEqual(related(demoCatalog, "missing"), []);
});
test("ledger adapter exports only allowlisted metadata", () => {
  const result = fromLedger(example());
  assert.equal(result[0].status, "received");
  assert.equal(result[0].implementationAvailable, false);
  assert.ok(!JSON.stringify(result).includes("PRIVATE"));
  assert.ok(!JSON.stringify(result).includes("access_token"));
});
test("malformed records, unsafe URLs and duplicate revisions fail closed", () => {
  for (const patch of [
    { source_url: "javascript:alert(1)" },
    { source_url: "https://user:password@example.com" },
    { revision: 0 },
    { slug: "../../bad" },
    { status: "approved" },
    { tags: [42] },
  ]) {
    const data = example();
    Object.assign(data.entries[0], patch);
    assert.throws(() => fromLedger(data));
  }
  const data = example();
  data.entries.push(data.entries[0]);
  assert.throws(() => fromLedger(data));
});

async function serverFixture(t, options = {}) {
  const server = createArsenalServer(options);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  );
  const port = server.address().port;
  const raw = (path, headers = {}, method = "GET") =>
    new Promise((resolve, reject) => {
      const req = request(
        { hostname: "127.0.0.1", port, path, headers, method },
        (response) => {
          let data = "";
          response.setEncoding("utf8");
          response.on("data", (part) => (data += part));
          response.on("end", () =>
            resolve({
              status: response.statusCode,
              headers: response.headers,
              body: response.headers["content-type"]?.includes(
                "application/json",
              )
                ? JSON.parse(data)
                : data,
            }),
          );
        },
      );
      req.on("error", reject);
      req.end();
    });
  return { raw, port };
}
test("real HTTP catalog, search, details, related and 404 responses", async (t) => {
  const { raw } = await serverFixture(t);
  assert.equal((await raw("/api/catalog")).body.total, 6);
  assert.equal(
    (await raw("/api/search?q=moving%20sidebar")).body.results[0].component.id,
    "demo-gliding-sidebar",
  );
  assert.equal((await raw("/api/components/demo-gliding-sidebar")).status, 200);
  assert.ok(
    (await raw("/api/components/demo-gliding-sidebar/related")).body.results
      .length,
  );
  assert.equal((await raw("/data/ledger.json")).status, 404);
  assert.equal((await raw("/api/components/missing")).status, 404);
  assert.equal((await raw("/api/search?status=nonsense")).status, 400);
});
test("HTTP rejects foreign host/origin, cross-site and mutation requests", async (t) => {
  const { raw } = await serverFixture(t);
  assert.equal((await raw("/api/catalog", { host: "evil.test" })).status, 403);
  assert.equal(
    (await raw("/api/catalog", { origin: "https://evil.test" })).status,
    403,
  );
  assert.equal(
    (await raw("/api/catalog", { "sec-fetch-site": "cross-site" })).status,
    403,
  );
  assert.equal((await raw("/api/catalog", {}, "POST")).status, 405);
  assert.equal(
    (await raw("/api/catalog")).headers["access-control-allow-origin"],
    undefined,
  );
});
test("intake failures are visible and do not leak paths or substitute samples", async (t) => {
  const { raw } = await serverFixture(t, {
    intakeDir: "/PRIVATE",
    catalogLoader: () => {
      throw Error("/PRIVATE/token");
    },
  });
  const response = await raw("/api/catalog");
  assert.equal(response.status, 503);
  assert.ok(!JSON.stringify(response).includes("/PRIVATE"));
  assert.equal(response.body.components, undefined);
});

test("homepage and deep links serve the same safe application shell", async (t) => {
  const { raw } = await serverFixture(t);
  for (const path of [
    "/",
    "/components",
    "/collections",
    "/incoming",
    "/docs",
    "/docs/slider",
    "/reference/example%401",
  ]) {
    const result = await raw(path);
    assert.equal(result.status, 200);
    assert.match(result.headers["content-type"], /text\/html/);
    assert.match(result.body, /<main id="main"/);
    assert.match(
      result.headers["content-security-policy"],
      /script-src 'self'/,
    );
    assert.ok(
      !result.headers["content-security-policy"].includes("unsafe-inline"),
    );
  }
});
test("assets are explicitly allowlisted, not served from arbitrary filesystem paths", async (t) => {
  const { raw } = await serverFixture(t);
  for (const path of [
    "/app.js",
    "/examples.js",
    "/theme.js",
    "/search-engine.js",
    "/styles.css",
    "/favicon.svg",
    "/fonts/geist.woff2",
  ])
    assert.equal((await raw(path)).status, 200, path);
  for (const path of [
    "/AGENTS.md",
    "/.env",
    "/server/index.mjs",
    "/node_modules/@fontsource-variable/geist/package.json",
    "/public/../server/index.mjs",
    "/data/ledger.json",
    "/intake/package.json",
  ])
    assert.equal((await raw(path)).status, 404, path);
});
test("original examples are searchable without marking intake records as built", async () => {
  const { examples } = await import("../public/examples.js");
  assert.equal(examples.length, 8);
  assert.equal(new Set(examples.map((x) => x.id)).size, 8);
  const records = examples.map((x) => ({
    ...x,
    summary: x.description,
    status: "example",
  }));
  assert.equal(
    search(records, "a slider for volume").results[0].component.id,
    "slider",
  );
  for (const example of examples) {
    assert.ok(example.markup);
    assert.ok(example.behavior);
    assert.ok(!example.markup.includes("<script"));
  }
});
test("responsive and accessibility contracts remain present", async () => {
  const { readFile } = await import("node:fs/promises");
  const css = await readFile(
    new URL("../public/styles.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /max-width:\s*600px/);
  assert.match(css, /min-width:\s*1800px/);
  assert.match(css, /minmax\(0,\s*1fr\)/);
  assert.match(css, /focus-visible/);
  const html = await readFile(
    new URL("../public/index.html", import.meta.url),
    "utf8",
  );
  assert.match(html, /Skip to content/);
  assert.match(html, /aria-live="polite"/);
});
