---
name: acceptance-audit
description: "Check whether this card's code meets the acceptance criteria"
label: "Acceptance audit"
category: verify
workhorse-version: 0.3.0
---

## Your task: Acceptance audit

Check whether the code on this card's branch meets the acceptance criteria. This is a compliance check against the specs, not a general code-quality review.

1. Identify what this card was supposed to do: diff the spec changes on this branch against the upstream base (scoped to `.workhorse/specs/`) to see the card's own additions and edits. Also read the surrounding specs in the same area(s) — they describe existing behaviour that must still be met and not regressed
2. Diff this card's branch against its upstream base to see the implementation (a card's base is usually `main`, but may be a parent card's branch)
3. Walk the criteria one by one — both the card's new/changed criteria and the surrounding ones that should still hold. Does the code deliver each one? Has any existing behaviour regressed?
4. Flag criteria that are not yet implemented, partially implemented, or implemented incorrectly — and flag regressions separately
5. Flag any behaviour in the code that isn't covered by a criterion — that's either missing from the spec, or shouldn't be in the code

Post findings grouped by spec, each finding tied to a specific criterion with file and line references.
