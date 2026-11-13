# Sync gives way to the app

Implements [SYCAN](../../specs/datatrak/sync-giving-way.md).

## Where the work lives

On this branch, `tup-3222-auto-sync-cancel`, which also carries TUP-3193: the PGlite web worker,
OPFS storage, startup logging, and the survey-response and push changes around them. The
giving-way work is `ConnectionWatcher`, the `runPatiently` parts of `ClientSyncManager`, the
cancellation hook in `snapshotOutgoingChanges`, `SyncNeededNotification`, and the new
`lastSuccessfulSyncTime` fact. Splitting the two apart is a packaging decision for whoever opens
the pull request, not a change to the behaviour specced here.

## Approach as built

Detection hangs off knex's connection pool. PGlite is one Postgres session, so knex-pglite pins
the pool at a single connection. While sync holds a transaction, that transaction owns the
connection, and every query that asks the pool for it is the app's. Wrapping
`client.acquireConnection` gives a count of queries waiting, and the pool's `release` event gives
the last time anything used it.

Each step that gives way runs through `runPatiently`: wait for idle, open a transaction, and let
the step throw a private `CancelledForAppError` between its queries if the app starts waiting.
The throw rolls the transaction back, and the loop waits for idle again. A step gets thirty
minutes of this before sync gives up, and giving up is reported as an ordinary sync error.

## Steps

- [x] Add a `lastSuccessfulSyncTime` sync fact so the last sync survives reloads
- [x] Add `ConnectionWatcher`: count queries waiting for the connection, and wait until idle
- [x] Add `runPatiently` and `cancelIfAppIsWaiting` to `ClientSyncManager`
- [x] Give way while snapshotting outgoing changes in the push phase
- [x] Give way while saving pulled changes in the persist phase, and end the central session
      before the save rather than after it
- [x] Persist and restore the last successful sync time
- [x] Add the banner that asks for a sync after a day without one
- [x] Unit tests for `ConnectionWatcher`
- [ ] Typecheck, lint, and test
- [x] Run the outgoing-snapshot reads one model at a time, so cancelling does not leave reads
      outstanding against a rolling-back transaction

## Notes

`snapshotOutgoingChanges` read every model concurrently with `Promise.all`, and
`cancelIfAppIsWaiting` throws from inside one of those reads. `Promise.all` rejects on the first
throw, so the transaction started rolling back with the sibling reads still outstanding against
it and nothing left awaiting them, which surfaces as unhandled rejections rather than a wrong
result. The reads now run one model at a time with the cancellation check between them; PGlite
serialises them on its single connection anyway, so nothing is lost.

Ending the central session twice is harmless, which the push-then-give-up path relies on:
`connectToSession` does not reject a completed session that has no errors, and
`completeSyncSession` sets `completed_at` again and drops the snapshot table with `IF EXISTS`.
