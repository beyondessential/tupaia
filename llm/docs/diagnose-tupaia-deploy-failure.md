# Diagnosing Tupaia Branch-Instance Deploy Failures

A runbook for diagnosing a failed Tupaia branch-instance (feature/dev) deploy that
surfaces in GitHub Actions as `Build failed! ... check ~/logs/deployment.log`.

Based on a real incident (2026-07-16).

## The core lesson: the CI error is misleading

When a deploy fails, the GitHub Actions log shows something like:

```
::error::Build failed! Connect to instance <id> and check the logs at
~/logs/deployment.log and /var/log/cloud-init-output.log
[ERROR]: Waiter InstanceExists failed: Max attempts exceeded
```

This comes from [`packages/devops/scripts/ci/triggerRedeploy.sh`](/packages/devops/scripts/ci/triggerRedeploy.sh).
**It does NOT mean the yarn/webpack build failed.** The CI step only launches a new
EC2 instance and polls it; it never sees _why_ the remote startup script failed. It
only sees that the instance never signalled success in time.

- `Build failed!` here means "the remote startup build script did not complete
  successfully" — a generic catch-all, not a webpack/tsc error.
- `[ERROR]: Waiter InstanceExists failed: Max attempts exceeded` is just the AWS
  polling waiter timing out because the remote startup build never signalled success.
  It is a **symptom, not the cause**.

**The real failure is on the EC2 instance.** You cannot diagnose this from the CI log
alone — you must get onto the box.

## Step 1 — Get onto the instance

The CI log prints the new instance ID and a console link. Connect via either:

- **EC2 Instance Connect** — use the console link in the CI log, or
- **SSM** — `aws ssm start-session --target <instance-id>`

## Step 2 — Read the real logs

The deploy user is usually `ubuntu`, so the deployment log lives at
`/home/ubuntu/logs/deployment.log`.

```sh
# The real build/deploy log
tail -n 300 ~/logs/deployment.log

# Cloud-init / startup-script log (captures the very earliest boot phases)
tail -n 300 /var/log/cloud-init-output.log

# Jump straight to failures
grep -niE "error|failed|fatal|not found|cannot" ~/logs/deployment.log | tail -n 40
```

## Step 3 — Identify which phase actually died

Work out which deploy phase died, in order:

1. **git fetch / reset** — pulling the branch onto the instance
2. **Tailscale** — network mesh bring-up
3. **`Building deployable packages`** — `yarn install` + build
4. **Bitwarden login / unlock**
5. **`Fetching environment variables`** — pulling `.env` files from Bitwarden

A build that reaches `Done with warnings` succeeded — do not be fooled by warnings
(see red herrings below). Look for the _last_ phase that started.

## Known failure mode — Bitwarden env-fetch

If the build **succeeded** (`Done with warnings`, Yarn 4.17.0) but the
`Fetching environment variables` phase died with something like:

```
$ bw unlockNot found.
Fetching variables for <first-package>...jq: error: syntax error, unexpected ')'
map(select(.collectionIds[] | contains ())) | .[] .notes
```

then the **Bitwarden collection ID resolved to EMPTY**.

### Mechanism

[`scripts/bash/downloadEnvironmentVariables.sh`](/scripts/bash/downloadEnvironmentVariables.sh)
derives ONE global collection ID _before_ the package loop, from a hardcoded path:

```sh
COLLECTION_PATH='Engineering/Tupaia General/Environment Variables'
COLLECTION_ID=$(yarn bw get collection "$COLLECTION_PATH" | jq .id)
```

When `bw get collection` cannot find/reach the collection it prints `Not found.` to
stderr and emits nothing on stdout. `jq .id` then reads empty input, emits nothing,
and **exits 0** — so `set -e` does not catch it and `COLLECTION_ID` becomes an empty
string.

Later, inside the per-package loop, the unquoted `$COLLECTION_ID` is interpolated into
the jq filter:

```sh
jq --raw-output "map(select(.collectionIds[] | contains ($COLLECTION_ID))) | .[] .notes"
```

With `COLLECTION_ID` empty this becomes `contains ()` → a **jq compile error** → the
`bw` CLI crashes with `write EPIPE`.

**The package named in the error (e.g. `admin-panel-server`) is just the FIRST one
iterated — it is not special.** Do not chase that package.

### Root cause + fix for this mode

This is a **Bitwarden session / collection-access problem on that instance, NOT the
deployed code.** Two possibilities:

1. **The vault is not unlocked / `BW_SESSION` is invalid** — the deploy unlocks with
   `yarn bw unlock --passwordenv BW_PASSWORD` and evals the resulting
   `export BW_SESSION=...`. If the account is not logged in, or `BW_PASSWORD` /
   the API creds are expired or rotated, unlock produces no session and every
   subsequent `bw` call returns `Not found.`.
2. **The API-key account lacks access to the collection** — logged in fine, but that
   account cannot see `Engineering/Tupaia General/Environment Variables`.

Diagnose on the box:

```sh
# Is a Bitwarden session present? Are the API creds set?
env | grep -i '^BW_'

# Can this account actually resolve the collection?
yarn bw get collection 'Engineering/Tupaia General/Environment Variables'
```

Interpretation:

- `You are not logged in` / unlock error → re-establish the session. Log in with the
  deploy's API credentials (`bw login --apikey` using `BW_CLIENTID` / `BW_CLIENTSECRET`),
  then `bw unlock` (with `BW_PASSWORD`), and make sure `BW_SESSION` is exported.
- `Not found.` **while logged in** → the account is missing collection access (or the
  path changed). Grant that account access to the collection, or fix `COLLECTION_PATH`.

If the failure **reproduces across retries**, it points to expired/rotated
credentials or a permanent access change — not a transient hiccup.

## Ruling things out

### The merge is (usually) a red herring

Merging an old branch into a fresh-`dev` branch does **not** cause this **if it changed
no deploy/env code.** Verify:

```sh
git diff <base>..<merge> -- scripts/
```

In the real incident the env-fetch script was byte-identical to `dev`, so the merge was
exonerated. Prove it before blaming it.

### Also NOT the cause

- **NOT OOM** — no `Killed` / `heap` / out-of-memory lines in the log.
- **NOT a Node/yarn version mismatch.**
- **NOT a git conflict marker** left in a file.
- **NOT a missing npm dependency.**
- **Yarn peer-dependency warnings** (`YN0060`, `YN0002`, `YN0086`) are pre-existing,
  non-fatal noise. Ignore them.

### Node 24 red herring

The GitHub Actions warning:

```
Node.js 20 is deprecated ... forced to run on Node.js 24
```

on `aws-actions/configure-aws-credentials@v4` is **GitHub's runner** force-migrating
JS actions off the deprecated Node 20 _runner_ runtime. It is benign and unrelated to
Tupaia's own runtime. **Tupaia is still on Node 20.11.1** (see
[`.nvmrc`](/.nvmrc) and the `engines` field in `package.json`) and has never been
upgraded to Node 24.

## Suggested hardening (latent bug — not fixed here)

`scripts/bash/downloadEnvironmentVariables.sh` neither **quotes** `$COLLECTION_ID` nor
**fails** when `bw get collection` returns empty. As a result a Bitwarden hiccup
surfaces as a confusing `jq` compile error instead of a clear
"couldn't reach Bitwarden / collection not found" message. Worth hardening (e.g. fail
fast if `COLLECTION_ID` is empty, and quote the interpolation) so the next occurrence
is self-explanatory. _This runbook is the deliverable; the script change is a separate
follow-up._

## TL;DR

1. `Build failed!` + `Waiter InstanceExists ... Max attempts exceeded` = the remote
   startup build never signalled success. Get on the instance.
2. Read `~/logs/deployment.log` and `/var/log/cloud-init-output.log`; find the last
   phase that ran.
3. A `jq: ... unexpected ')'` / `contains ()` crash during `Fetching environment
   variables` = empty Bitwarden `COLLECTION_ID` = a Bitwarden session/access problem
   on the box, not your code.
4. Rule out the merge, OOM, versions, conflict markers, and the Node 24 warning before
   going deeper.
