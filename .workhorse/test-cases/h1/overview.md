# Sync gives way to the app

Scenarios verifying [SYCAN](../../specs/datatrak/sync-giving-way.md). The interesting cases need a
slow save, so manual runs want a low-spec device (or CPU throttling) and a project large enough
that the persist phase takes tens of seconds.

## Detecting that the app needs the database

- [x] Counts a query that is waiting for the connection, and stops counting it once it has one
      (verifies spec: SYCAN)
- [x] Still passes the connection through to the query it is counting
- [x] Reports idle only once nothing has used the connection for the settling period
      (verifies spec: SYCAN)
- [x] Is not idle while a query is waiting, however long it has been since the last one
      (verifies spec: SYCAN)
- [x] Stops waiting at the deadline when the connection is never idle (verifies spec: SYCAN)
- [ ] Sync's own queries inside its transaction do not count as the app waiting (verifies spec:
      SYCAN)

## Giving way

- [ ] Using the app during the persist phase cancels the save, and the app's query returns
      promptly rather than waiting for the whole save (verifies spec: SYCAN)
- [ ] A cancelled save leaves no records behind: data the app reads afterwards matches what it
      read before the attempt (verifies spec: SYCAN)
- [ ] The save retries once the app goes quiet, and succeeds without re-downloading (verifies
      spec: SYCAN)
- [ ] Using the app during the push phase cancels the outgoing snapshot, and it retries (verifies
      spec: SYCAN)
- [ ] An initial pull runs to completion while the app is used (verifies spec: SYCAN)
- [ ] A sync the user started from the Sync page gives way the same as a background one (verifies
      spec: SYCAN)

## Giving up

- [ ] A step that never gets an idle moment gives up after thirty minutes and reports a sync
      error (verifies spec: SYCAN)
- [ ] After giving up, the pull cursor is unchanged and the next sync downloads the same changes
      again (verifies spec: SYCAN)
- [ ] Changes pushed before a later step gave up are not pushed again (verifies spec: SYCAN)
- [ ] The central session is released when the download finishes, not when the save finishes, so
      a waiting save does not hold a server slot (verifies spec: SYCAN)

## Staying fresh

- [ ] The banner appears after a day without a successful sync, and its action starts a sync and
      opens the Sync page (verifies spec: SYCAN)
- [ ] The last successful sync time survives a reload, so the banner is right for a user who
      reopens the app (verifies spec: SYCAN)
- [ ] While a step waits for the app to go idle, the Sync page holds its last progress and
      message (verifies spec: SYCAN)

## Operational

- [ ] Sync still completes normally on a device that is not being used, with no added delay
      beyond the settling period
