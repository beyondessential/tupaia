# DataTrak offline/PWA performance audit

Audit of code that runs locally when DataTrak is installed as a web app. The offline stack is: React app → knex → PGlite (Postgres compiled to WASM) persisted to IndexedDB, with a `ClientSyncManager` that runs a push/pull sync every 30 seconds. Findings were verified against the built `dist/` output, not just the source.

Ranked by benefit-per-effort. Deliberately excluded: anything that amounts to "fewer/bulkier SQL calls" (per-model loops in `snapshotOutgoingChanges`, per-record `generateInstance` in `DatabaseModel.find`, batch sizing in the pull path), since another developer is already working on that.

---

### 1. Fix the service worker cache config so the app's biggest assets are actually cached
**Effort: ~3 lines of config · Benefit: huge, especially on poor connections**

`workbox-config.js` precaches `js, html, images…` but the glob pattern doesn't include `wasm` or `data`, and `maximumFileSizeToCacheInBytes` is 5 MiB. Looking at the built output, this means the three largest assets are **never precached**:

- `pglite-*.wasm` — 8.5 MB (extension not in glob)
- `pglite-*.data` — 4.7 MB (extension not in glob)
- `index-*.js` — 8.1 MB (exceeds the 5 MiB cap)

The service worker itself (`service-worker.ts`) is precache-only with no runtime caching fallback, so these ~21 MB rely entirely on the browser HTTP cache, which is exactly what gets evicted first on low-storage devices. Every eviction means a full re-download and WASM recompile at startup — and offline startup is fragile, since the app shell HTML is cached but its main script may not be. Raising the size cap and adding `wasm`/`data` to the glob is the single cheapest, biggest win here.

### 2. Enable `relaxedDurability` on PGlite
**Effort: 1 line · Benefit: large speed-up on every write**

```7:18:packages/datatrak-web/src/database/getConnectionConfig.ts
export const getConnectionConfig = () => {
  const connectionString = getEnvVarOrDefault('PG_LITE_CONNECTION_STRING', 'idb://datatrak-db');

  // IMPORTANT: Reuse the same PGlite instance to avoid data isolation issues
  if (!sharedPGliteInstance) {
    sharedPGliteInstance = new PGlite(connectionString);
  } 
  // ...
```

With the `idb://` VFS, PGlite by default blocks each query's result until the whole filesystem state is flushed to IndexedDB. `new PGlite(connectionString, { relaxedDurability: true })` returns results immediately and flushes asynchronously — the PGlite docs specifically recommend it for the IndexedDB VFS, and it typically yields an order-of-magnitude improvement on write-heavy work. This directly speeds up the sync persist stage, draft saves, and answer writes. Trade-off: a crash mid-flush could lose the last moments of writes, but sync makes the data recoverable from the server anyway.

### 3. Debounce the autocomplete question's search
**Effort: small · Benefit: removes a main-thread query storm while typing**

In `AutocompleteQuestion.tsx`, `searchValue` feeds straight into the query key with no debounce, so **every keystroke** fires a `value ILIKE '%text%'` query (unindexable pattern) against PGlite — which runs on the main thread, so typing itself janks. `EntitySelector.tsx` already debounces its search; the autocomplete question doesn't. Add the same debounce plus `keepPreviousData: true` so the list doesn't flash empty between keystrokes.

### 4. Scope the post-sync cache invalidation
**Effort: medium · Benefit: eliminates a refetch-and-rerender storm every 30 s**

```221:225:packages/datatrak-web/src/sync/ClientSyncManager.ts
      const { pulledChangesCount } = await this.runSync(urgent);
      if (pulledChangesCount) {
        await queryClient.invalidateQueries();
        this.models.clearCache();
      }
```

`invalidateQueries()` with no filter invalidates **every** react-query cache entry, so after any sync that pulls even one record, all active queries refetch simultaneously against the main-thread database while the user may be mid-survey. Sync already knows exactly which record types were pulled (they're in the snapshot); mapping changed record types to query-key prefixes (e.g. only invalidate `['tasks']` when tasks changed) would make the every-30-seconds steady state nearly free.

### 5. Skip idle sync cycles with a cheap pre-check
**Effort: small–medium · Benefit: cuts recurring background work on device and server**

Every 30 seconds, `runSync()` unconditionally opens a server sync session (streaming handshake), updates sync ticks, and runs `snapshotOutgoingChanges` — a `SELECT` per pushable model inside a repeatable-read transaction — even when nothing changed on either side. You already have `hasOutgoingChanges()` (fast `EXISTS` per model), but it's only used by `UnsyncedDataGuard`, not by the sync loop. Checking "any local changes?" first, and letting the server session request answer "any remote changes since tick X?" cheaply, would make idle cycles nearly free — that's most cycles, and it also helps battery.

### 6. Trim the startup JavaScript (~6 MB of it is dead weight for data collectors)
**Effort: medium · Benefit: seconds of load/parse time on old phones**

`dist/index.html` modulepreloads every chunk, i.e. they're all statically imported and parsed at startup:

- `muiIcons` — 2.9 MB: something is defeating tree-shaking of `@material-ui/icons` (likely the CommonJS interop in the Vite setup); the whole icon set ships
- `xlsx` — 2 MB: pulled in via the `@tupaia/utils` barrel (`WorkBookParser`, `filesystem`) and `ui-components` table export — spreadsheet parsing has no business in the offline collection path; lazy-`import()` it at usage sites or split the utils barrel
- `momentTimezone` — 826 KB: dragged in by `@tupaia/database` model code (`SurveyResponse/saveToDatabase.js`, `FeedItem.js`, `OneTimeLogin.js`); the full timezone database ships to a client that already uses `date-fns`
- `ace` + `reactAce` — 600 KB: a code editor, via the `ui-components` barrel (`SqlEditor`)

WASM aside, that's roughly 6 MB of ~16 MB of JS that an old phone parses on every cold start for features the offline user never touches.

### 7. Move PGlite into a Web Worker
**Effort: moderate (the largest on this list) · Benefit: structural fix for UI jank**

The PGlite instance is created on the main thread, so every query — including the sync persist stage writing thousands of rows — executes WASM Postgres on the UI thread. Items 2–5 reduce how often and how long that happens, but on a low-end phone the real fix is `PGliteWorker` (from `@electric-sql/pglite/worker`), which exposes the same interface `knex-pglite` consumes and adds leader election as a bonus (the current setup is single-tab-only by assumption — a second tab silently shares one instance). The main wrinkle to verify is the custom `TIMESTAMP` parser in `DatatrakDatabase.setCustomTypeParsers`, which reaches into `pglite.parsers` directly.

---

**Deliberately excluded:** anything that amounts to "fewer/bulkier SQL calls" (per-model loops in `snapshotOutgoingChanges`, per-record `generateInstance` in `DatabaseModel.find`, batch sizing in the pull path), since your colleague is already on that. One false lead worth recording: `MigrationManager` eagerly globs all ~1,160 server migrations (79 MB with fixtures), which looks alarming, but I confirmed the built dist only contains the 28 browser-relevant files — it's a dev-mode cost only.
