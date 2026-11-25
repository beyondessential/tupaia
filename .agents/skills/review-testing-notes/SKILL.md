---
name: review-testing-notes
description: "Review the product engineer's post-implementation testing notes for how thoroughly they cover the card's requirements and risk, and whether regression-worthy cases are automated at the right level of the test hierarchy"
label: "Review testing notes"
category: verify
workhorse-version: 0.3.0
---

## Your task: Review testing notes

If you don't already have this card's context (title, identifier, description) — for instance when running outside Workhorse — establish it first by following `.agents/docs/card-context.md`.

Once a card is implemented, the assigned product engineer tests it — manual testing plus the three classes of automated test (end-to-end, integration, unit) — and writes up their testing notes on the card. Review those notes: judge how thoroughly they cover the card's requirements and the risk around them, and whether what belongs in an ongoing regression suite has been automated at the right level. Produce a written review the user can cross-post to Linear.

Use the card's branch as the source of truth for the code and its end-to-end tests throughout.

### 1. Settle the source of truth first

Before reviewing anything, work out what the card is required to do. By this stage the committed specs are the authoritative statement of behaviour.

- Reconcile three inputs: the latest Linear card description, any Linear comments that update the requirements in a way that drifts from that description, and the committed spec changes on the card's branch (diff the branch against its upstream base, scoped to `.workhorse/specs/`)
- Treat the committed specs as the source of truth. Specs that have moved *ahead* of the Linear description are fine — they are simply more current
- Where Linear describes behaviour that is **missing from the specs**, the silence is ambiguous — ask the user which case applies, then act on it:
- **If the missing behaviour was deliberately dropped or superseded** — the specs are already correct (they don't document absences); only Linear is stale. Treat the specs as the source of truth and carry on. If another spec relied on the dropped behaviour, raise that as a finding — it doesn't block the review
- **If the missing behaviour is still required** — the specs need to catch up. For a small, scoped gap, reconcile it inline (pin down the intended behaviour with the user): treat the confirmed behaviour as part of the source of truth (reviewed for coverage and automation in steps 3 and 4 like any spec criterion), raise the spec update as a top finding, offer to draft it, and continue. For a substantial gap, pause and ask for the specs to be brought up to date first and implemented/tested/reviewed again — there's no sound baseline otherwise
- A single run should deliver a full review wherever possible; stopping is the exception

### 2. Find the testing notes

Testing notes live in card comments, which span the transition from Linear-hosted to Workhorse-hosted cards.

- Read them from the linked Linear card's comments (via the Linear MCP read tools) and from the Workhorse card's comments — review whatever is found in either or both
- Comments are not in your session context, so fetch them explicitly through the comment-reading tools rather than expecting them to be present
- If no testing notes exist in either place, say so and point the user at where notes are expected — don't review an empty set

### 3. Review how thoroughly the notes cover the work

- **Acceptance criteria** — every criterion in the source-of-truth specs, plus any behaviour confirmed as still-required while settling the source of truth in step 1
- **Edge cases** — cases you can identify from the specs and code that the notes don't address
- **Interactions** — existing functionality the change touches
- **Regressions** — the potential-risk blast radius, the areas the change could break beyond its own surface

Ground every gap you raise in the committed specs and the source code, so a suggestion speaks to behaviour the product actually has — not a case that isn't relevant to it. Check before you raise it.

### 4. Verify automated coverage and test-hierarchy balance

Anything that would previously have gone into a manual regression suite is expected to be an automated test now. Confirm this against the actual tests on the branch, not the notes' claims alone.

- For each case the notes describe as covered, confirm a matching automated test exists on the branch at the class claimed (end-to-end, integration, or unit)
- Every workflow is covered in full by at least some end-to-end tests
- Where a range of specific or edge cases could be covered more cheaply, they belong pushed down to integration or unit tests rather than left as end-to-end tests — e2e tests are slower in CI and more brittle
- Flag a regression-worthy case that is only manually tested, so it can be automated
- Flag imbalance in either direction: a workflow with no end-to-end coverage, or edge cases carried by end-to-end tests that belong lower in the hierarchy

### 5. Feed classes of gap back upstream

If a gap is not a one-off miss but a **class or pattern** of test case that scenario design should have caught before implementation reached testing-notes review, suggest the user add that class or pattern to the Draft test cases skill — or to whichever skill they used to set up this card's test cases — so future cards catch it earlier. Frame this as a process improvement, separate from the card's own findings.

### 6. Write it up

- Post the review as a structured written message the user can cross-post to Linear — clear enough to stand on its own for a reader who wasn't in the conversation
- You cannot post to Linear or to the Workhorse card yourself; deliver the write-up in chat for the user to place where they want it
- Offer to act on the findings: automate missing test cases (see the Automate tests skill) or fix inadequate or broken automated tests
- Do not edit the testing notes
