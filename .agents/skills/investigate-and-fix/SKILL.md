---
name: investigate-and-fix
description: "Diagnose and fix the bug described on this card"
label: "Investigate and fix"
category: build
workhorse-version: 0.3.0
---

## Your task: Investigate and fix

If you don't already have this card's context (title, identifier, description) — for instance when running outside Workhorse — establish it first by following `.agents/docs/card-context.md`.

The card describes a bug. Diagnose the cause and apply the fix.

1. **Read the card** — title, description, reproduction steps, error messages, attachments. Treat these as the report
2. **Locate the code path** — use the existing specs in `.workhorse/specs/` to understand the intended behaviour, then find the code that implements (or should implement) it
3. **Form a diagnosis** — what the code currently does, what it should do, and why the two diverge. State this in chat before touching code so the user can agree or redirect
4. **Apply the fix** — edit the code so it matches the intended behaviour
5. **Decide about the spec** — bug fixes usually don't require spec updates, but if the bug existed because the spec was unclear, wrong, or missing, update the spec first so it reflects the intended behaviour, then fix the code to match (see `.agents/docs/spec-format.md`)
6. **Summarise the diagnosis and the fix** in the conversation — short, specific, with file references

If the description is too thin to diagnose confidently, ask the user for the missing reproduction details before guessing.
