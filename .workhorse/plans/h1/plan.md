# Sync gives way to the app

Implements [SYCAN](../../specs/datatrak/sync-giving-way.md).

## Approach

The work already exists on `tup-3222-auto-sync-cancel`, but that branch also carries TUP-3193
(the PGlite worker, OPFS storage, and the pull batch-size change). Only the giving-way work
belongs on this card, so it is applied deliberately rather than cherry-picked, leaving the pull
batch size and the worker alone.

Detection hangs off knex's connection pool. PGlite is one Postgres session, so knex-pglite pins
the pool at a single connection. While sync holds a transaction, that transaction owns the
connection, and every query that asks the pool for it is the app's. Wrapping
`client.acquireConnection` gives a count of queries waiting, and the pool's `release` event gives
the last time anything used it.

Each step that gives way runs through `runPatiently`: wait for idle, open a transaction, and let
the step throw a private `CancelledForAppError` between its queries if the app starts waiting.
The throw rolls the transaction back, and the loop waits for idle again. A step gets thirty
minutes of this before sync gives up.

## Steps

- [ ] Add a `lastSuccessfulSyncTime` sync fact so the last sync survives reloads
- [ ] Add `ConnectionWatcher`: count queries waiting for the connection, and wait until idle
- [ ] Add `runPatiently` and `cancelIfAppIsWaiting` to `ClientSyncManager`
- [ ] Give way while snapshotting outgoing changes in the push phase
- [ ] Give way while saving pulled changes in the persist phase, and end the central session
      before the save rather than after it
- [ ] Persist and restore the last successful sync time
- [ ] Add the banner that asks for a sync after a day without one
- [ ] Unit tests for `ConnectionWatcher` and `runPatiently`
- [ ] Typecheck, lint, and test

## Notes

`snapshotOutgoingChanges` read every model concurrently with `Promise.all`. Cancelling out of
that leaves the sibling reads running against a transaction that is being rolled back, so the
reads run one model at a time instead, checking for cancellation between them. PGlite serialises
them on its single connection anyway, so nothing is lost.

Ending the central session twice is harmless: `connectToSession` does not reject a completed
session that has no errors, and `completeSyncSession` sets `completed_at` again and drops the
snapshot table with `IF EXISTS`.
