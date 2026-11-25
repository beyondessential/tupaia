---
name: rebase-post-merge
description: "Rebase the branch past a merge so a follow-up PR carries only new work"
label: "Rebase"
category: other
workhorse-version: 0.3.0
---

## Your task: rebase past the merge

This card's previous PR was merged, and a follow-up PR is now open on the same branch. The branch
still carries the commits that PR merged, so the follow-up's diff replays work that has already
landed. Your job is to drop those commits and leave only the work done since.

Workhorse tried this automatically and hit conflicts, which is why you have it.

The user message names the base branch and the merged PR's number.

1. `git fetch origin` to refresh remote refs
2. Get the merged PR's head commit: `gh pr view <number> --json headRefOid -q .headRefOid`. That
   commit is the last one the merge covered, so everything up to and including it is already on the
   base branch
3. Work out whether those commits are yours to drop at all. This is **two** checks, and running
   the rebase without both is how this ends in a loop:
   - `git merge-base --is-ancestor <that-sha> HEAD`: is the merged head still in the branch's
     history? If **not** (non-zero exit, or the commit is unknown), the branch has already been
     rebased past the merge
   - `git merge-base --is-ancestor <that-sha> origin/<base-branch>`: is the base already holding
     that head? If it **is**, the merge put the branch's commits on the base as they are (a merge
     commit, not a squash), so the merged work is already gone from your diff and there is nothing
     to drop. Note this check answers yes for as long as the base holds the head, so no amount of
     rebasing will change it. Going on the first check alone would have you rebase, hit the same
     conflict, and report the branch fixed when nothing moved

   In either case: skip straight to force-pushing (step 6) and report that no rebase was needed, so
   Create New PR can be retried and will open the PR from the branch as it stands. Do not run the
   rebase: dropping a range from a head the branch reaches only through the base replays the base's
   own history and conflicts against it. Only when the head is in the branch's history *and* absent
   from the base do you continue to step 4
4. Otherwise `git rebase --onto origin/<base-branch> <that-sha>` — this drops the merged commits by
   range rather than replaying them, which is what keeps the rebase clean. Do NOT use a plain
   `git rebase origin/<base-branch>`: it replays the already-merged commits and conflicts against
   the squashed form of the branch's own work
5. Resolve any conflicts as they come. These are against genuine upstream changes, so use the
   card's specs, description, and conversation history to decide which side to favour. `git add`
   the resolved files and `git rebase --continue`
6. Force-push with `git push --force-with-lease origin <branch>`
7. **Check for soft conflicts** — the branch now sits on newer upstream code, so inspect the diff
   against local specs and code for assumptions the upstream changes invalidated. Use your
   judgement about what matters
8. Report what the branch now contains, any conflicts you resolved and how, and any soft conflicts
   you found

If the rebase turns out to be unsalvageable, `git rebase --abort` and explain what blocked it
rather than leaving the branch mid-rebase.
