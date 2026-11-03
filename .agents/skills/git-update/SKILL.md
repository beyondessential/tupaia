---
name: git-update
description: "Rebase onto latest upstream, checking for soft conflicts"
label: "Update"
category: other
workhorse-version: 0.7.2
---

## Your task: Update branch from upstream

Bring this card's branch up to its upstream. The upstream is the parent branch this card was based on — usually `main`, but cards that depend on a parent card update from the parent's branch instead. Determine the actual branch names from `git rev-parse --abbrev-ref HEAD` (the card branch) and `git rev-parse --abbrev-ref @{upstream}` (the base). Use those exact refs, not the workspace default.

Most branches are brought up by rebasing. A branch that has taken merge commits is the exception: a parent card acting as an epic holds a merge commit for each card that merged into it. A rebase would flatten those merges into copies of the merged cards' commits and drop each merged card's recorded head from the branch's history, so such a branch takes the upstream by merging it in.

1. Run `git fetch origin` to refresh remote refs, then verify the fetch updated the upstream by comparing `git rev-parse origin/<base-branch>` before and after — if the SHA didn't change but `git ls-remote origin <base-branch>` reports a different SHA, abort and report the discrepancy rather than updating from stale state
2. Run `git rev-list --merges origin/<base-branch>..HEAD`. If it prints nothing, run `git rebase origin/<base-branch>`. If it prints any commit, run `git merge origin/<base-branch>` instead and do not rebase
3. If a hard conflict occurs during the rebase or merge, resolve it step by step. Use the card's specs, description, and conversation history to decide which side to favour
4. **Always check for soft conflicts** — even if the update completed cleanly, inspect the full diff between the old and new base against local specs and code for assumptions invalidated by upstream changes. Use your judgement about what matters
5. After a rebase succeeds, force-push with `git push --force-with-lease origin <card-branch>` so the remote reflects the rebased history. After a merge succeeds, push with plain `git push origin <card-branch>`: nothing already pushed was rewritten, so no force is needed
6. Report what upstream changes came in, and whether you rebased or merged. If soft conflicts exist, explain each one: what the local assumption was, what upstream changed, and how you resolved it (or ask the user if ambiguous)
7. Apply straightforward resolutions directly. Ask the user about ambiguous ones.

When local changes are small, the soft-conflict check can be brief. When local changes are large, examine thoroughly.
