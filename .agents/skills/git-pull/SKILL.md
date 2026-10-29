---
name: git-pull
description: "Pull remote changes and reconcile with local work, checking for soft conflicts"
label: "Pull"
category: other
workhorse-version: 0.7.2
---

## Your task: Pull remote changes

Pull the latest remote changes into the card's branch and reconcile them with local work.

1. Run `git pull` to fetch and integrate remote changes. If you pull with rebase, use `git pull --rebase=merges` so the merge commits the local branch holds are kept rather than flattened
2. If a hard conflict occurs, resolve it using the card's specs, description, and conversation history to make informed decisions
3. **Always check for soft conflicts** — even if git merged cleanly, inspect the incoming changes against local specs and code for assumptions that have been invalidated by the remote changes. Use your judgement about what matters
4. Report what changed. If soft conflicts exist, explain each one: what the local assumption was, what the remote change did, and how you resolved it (or ask the user if ambiguous)
5. After pulling with rebase, force-push with `git push --force-with-lease origin <card-branch>` so the remote reflects the rebased history
6. Apply straightforward resolutions directly. Ask the user about ambiguous ones.

When local changes are small, the soft-conflict check can be brief. When local changes are large, examine thoroughly.
