---
id: SYCAN
---

# Sync gives way to the app

DataTrak's local database is PGlite, which is a single Postgres session with exactly one
connection. While sync holds that connection inside a transaction, every query the app makes
waits behind it, so the app freezes. On a low-spec device the persist phase of an incremental
sync can hold the connection long enough for that freeze to be unworkable.

Sync therefore yields: it only takes the connection when the app is not using it, and it
abandons the work in progress as soon as the app needs the connection back, retrying later.

## Detecting that the app needs the database

- [ ] Sync observes queries as they ask the connection pool for the single connection, and counts
      how many are waiting.
- [ ] While sync holds a transaction, that transaction owns the connection, so any query asking
      the pool for it comes from the app. Sync's own queries run on the transaction's connection
      and are not counted.
- [ ] The database is idle when no query is waiting for the connection and none has used it for a
      short settling period.

## Which work gives way

- [ ] Taking the point-in-time snapshot of outgoing changes, in the push phase, gives way.
- [ ] Saving pulled changes from the local snapshot table into the real tables, in the persist
      phase of an incremental sync, gives way.
- [ ] Streaming pulled changes into the local snapshot table does not give way. Each batch takes
      the connection only briefly, so the app interleaves with it.
- [ ] The initial sync does not give way. It holds a single transaction for the whole pull, and
      the user has no local data to work with until it finishes.
- [ ] A sync the user asked for explicitly gives way on the same terms as a background sync.

## Giving way and retrying

- [ ] Each step that gives way waits for the database to be idle before opening its transaction.
- [ ] The step checks whether the app is waiting between its own queries, and when it is, the
      transaction rolls back and the step waits for the database to be idle again before retrying.
- [ ] A step that has given way leaves no partial state behind: the rollback returns the database
      to where it was before the attempt.
- [ ] Within one sync, retrying persist does not re-download anything. The pulled changes are
      already in the local snapshot table, and each attempt saves from there.
- [ ] Each step that gives way has its own budget of thirty minutes to wait and retry within,
      after which sync stops trying.
- [ ] Changes already pushed to the central server stay pushed when a later step gives up, so
      the next sync pushes only what has changed since.
- [ ] Sync ends its session on the central server as soon as everything is downloaded, before the
      save begins, so a save that waits for a busy app does not hold one of the server's few
      concurrent sessions.
- [ ] Sync advances its pull cursor only as part of the save transaction, so a sync that gives up
      leaves the device's cursor where it was.
- [ ] A later sync starts a fresh session, discarding any snapshot left by a sync that gave up and
      downloading the same changes again.

## What the user sees

Sync reports giving up the same way it reports any other sync it could not finish, and the
progress it was showing stays where it stopped.

- [ ] While a step waits for the app to go idle, the sync page holds the progress and message it
      was last showing.
- [ ] A sync that gives up reports a sync error, telling the user the app has been busy and sync
      will try again soon.

## Keeping the user's data fresh

Sync never forces a save on a user who is working, so a device in constant use can go a long time
without a successful sync.

- [ ] After a day without a successful sync, the app shows a banner telling the user it has been a
      while, with an action that starts a sync and shows its progress on the sync page.
- [ ] The time of the last successful sync survives reloads, so the banner is accurate for a user
      who closes and reopens the app.
