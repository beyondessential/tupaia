# DataTrak Improvements

Make DataTrak usable on low-spec devices by changing how its database is stored and by making sync timing aware of what the user is doing. Spend any remaining capacity on a set of Tamanu Mobile performance fixes left over from the Mobile Love project.

## Problem

DataTrak (`datatrak-web`) is an offline-first data collection app used in the field, often on budget Android hardware over poor connectivity. Two things make it feel slow or get in the user's way on those devices:

1. **Storage.** The local database is PGlite backed by IndexedDB (`idb://datatrak-db`, see `packages/datatrak-web/src/database/getConnectionConfig.ts`). IndexedDB is a slow VFS for a relational engine, and it is the floor under every read and write the app does.
2. **Sync timing.** The sync service runs on a fixed timer (30s regular, 10s urgent, `ClientSyncManager.ts:33-34`). It starts on login and fires regardless of what the user is doing. Incremental sync is deliberately built to avoid blocking the user (it stages pulled data in snapshot tables rather than holding a long write transaction), but the final persist transaction plus a blanket `queryClient.invalidateQueries()` on every sync that pulled anything (`ClientSyncManager.ts:223`) still lands jank at an arbitrary moment, including mid-data-entry.

Separately, the Tamanu Mobile app (a different product, `beyondessential/tamanu`, `packages/mobile`) has a backlog of performance fixes from the Mobile Love project that target the same class of low-spec Android device. The highest-value, lowest-effort items have shipped; what remains is listed below.

## Audience

Field data collectors using DataTrak on low-spec Android devices over intermittent connectivity. The same hardware profile applies to the Tamanu Mobile users the leftover fixes target (Oppo-class budget devices, IRD Pakistan deployment).

## Components

### 1. Database storage mechanism

Move DataTrak's local store from IndexedDB to **OPFS (Origin Private File System)**. OPFS gives PGlite real file I/O instead of the IndexedDB key-value shim, which is the floor under every read and write on low-spec devices.

The migration path for existing on-device data, and OPFS's environment requirements (cross-origin isolation, browser support on the target devices, behaviour in the PWA/install context), still need settling before this is card-ready (see open questions).

### 2. Intelligent sync timing

Replace the fixed-interval scheduler with one that lands sync when it will cost the user least:

- **Sync when the user is idle**, not on a blind timer that can fire mid-entry.
- **Piggyback the unavoidable blocking window on moments the user already expects to wait**, such as submitting a survey, where a short pause is already the natural rhythm.
- Keep urgent/manual sync available on demand.

### 3. Blocking sync modal

When a sync is going to block the user, make that honest rather than letting jank appear unexplained:

- Raise a blocking modal for the duration of the blocking work, so the blocked state is visible and attributable.
- Let the user skip or defer that sync and have it try again later.

This is the committed direction: rather than chasing a fully invisible sync, accept a short, signposted blocking window, timed by component 2 to land where it is least disruptive (survey submit, idle). The modal owns that window and gives the user a way out (skip/defer).

### 4. Other DataTrak plans (Chris)

Chris has further DataTrak improvements in mind that are not yet captured here. To be gathered and folded in.

### 4. Other Tamanu Mobile fixes (Mobile Love leftovers)

### 6. Other Tamanu Mobile fixes (Mobile Love leftovers)

Any remaining capacity goes to the unfinished Mobile Love items. Note these are in a different repository (`beyondessential/tamanu`, `packages/mobile`); cards for them are implemented there, not in Tupaia. The project lead picks which to adopt from the menu below; they are candidates, not a committed set.

Candidates from Mobile Love:

- **Over the air updates** 
- **TAM-7105 — Batch-write survey response answers** (Backlog). Survey submit writes answers one at a time inside the transaction. Batch-insert the rows. Note: DataTrak has already had success with this approach, so there is a pattern to port.
- **TAM-7109 — Fix CustomField N+1** (Backlog). One `PatientFieldDefinition.findOne` per custom field; fetch definitions once in the parent.
- **TAM-7129 — A3: do the pull-side transform in SQL instead of JS** (Backlog). The large "sync engine" item: incremental pull currently double-serialises every page through JS, freezing the UI. Doing the transform in SQL is the alternative to a JS-worker approach.
- **TAM-7102 — Confirm mandatory questions only block submission when visible** (Upcoming). Verification task.

Already in code review and likely to merge without needing a slot here:

- **TAM-7126 — A1: skip the whole-database `foreign_key_check` on zero-record syncs** (Code Review).
- **TAM-7128 — A4: stage `sync_snapshot` in an attached throwaway database** (Code Review).

## Open questions

- **OPFS requirements.** What does OPFS need on the target devices and in the app's PWA/install context: cross-origin isolation headers, browser version floor, behaviour across tabs?
- **Data migration.** How does existing on-device data move from the IndexedDB store to OPFS, or do users re-sync from scratch? A full re-sync on low connectivity is expensive, so this matters.
- **Chris's plans.** What else is on Chris's list for DataTrak?
- **Mobile scope.** Which leftovers the lead adopts, and whether cross-repo work (cards landing in `beyondessential/tamanu`) is tracked under this project or separately.
- **Query invalidation.** The blanket `queryClient.invalidateQueries()` after sync is a known jank source. In scope here, or already handled elsewhere?