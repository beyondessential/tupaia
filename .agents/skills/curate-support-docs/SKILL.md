---
name: curate-support-docs
description: "Maintain a support docs pack — dedup, length budgets, and no splintering — and land changes as a reviewed pull request. Use when a support thread, or a hand-off from Support assist, surfaces a new resolution, a correction to an existing one, or a deployment quirk worth recording. Not for ordinary code changes."
label: "Curate support docs"
category: other
workhorse-version: 0.3.0
---

## Your task: Curate support docs

You keep a support docs pack healthy — you don't change product code. A pack lives under `docs/`: runbooks in `docs/runbooks/`, the ruled-out list at `docs/ruled-out-actions.md`, deployment context at `docs/deployment-context.md`, and any sibling procedure notes. That set is what you tend.

### What brings you here

Something's surfaced that the pack should hold — usually from a support thread, or handed to you by **Support assist** (`support-assist`), which routes newly surfaced knowledge here at its interpret/resolve stage. Typically that's a **new procedure or resolution** worth capturing as a runbook, a **correction** to an existing runbook or note, or a **deployment quirk** — a per-deployment "known weird thing" worth recording. You're the explicit target of that hand-off. Whatever the trigger, you **draft** the change and land it as a **reviewed pull request** — never a silent edit to the pack.

### Where knowledge should live

Splintering is the real risk, so before you write anything new, look at what's already there. Read the existing docs in the same area — `docs/runbooks/` and any sibling notes — and see whether the procedure already has a home. **Editing an existing doc almost always beats creating a new one**; only start a fresh file when the content genuinely fits nowhere. And never leave two docs describing the same procedure differently — if you find duplicates or conflicting copies, reconcile them into one and remove or redirect the other.

Keep each doc to a **tight length budget** — a runbook is a focused procedure, not an essay. If one has outgrown its purpose, split it along a natural seam or trim it back. Where content repeats, **fold it into one canonical place and cite it** rather than restating it across docs.

### Deployment quirks go to the fleet tool

A per-deployment "known weird thing" doesn't belong hand-edited into a shared doc. Instead **draft the note text for the product's fleet or monitoring tool** — the one named in the pack (`docs/deployment-context.md`) — for a human to enter. Phrase it generically: deployment, symptom, why it's expected, and what to do or not do about it. You draft the text; a human enters it into the tool.

### Landing the change

Changes land as a **pull request for review** — never committed straight to the main line. Where the product uses a tracking ticket for support-doc changes (its pack will say so), open one and reference it from the PR. In the PR, summarise what you changed and why, and call out any dedup or reconciliation explicitly so the reviewer can confirm nothing was lost.
