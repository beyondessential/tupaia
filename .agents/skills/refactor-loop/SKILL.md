---
name: refactor-loop
description: "Take stock of this card's code and refactor it, in loops, until it is as small, DRY and well structured as it sensibly can be, with behaviour unchanged"
label: "Refactor loop"
category: build
workhorse-version: 0.7.2
---

## Your task: make the code smaller and better structured, behaviour unchanged

Agents write code by adding. Each fix, review round and feature lands as more code beside what was there, and nobody steps back to see that three components do the same thing, that a helper duplicates one the codebase already has, or that a layer exists only to reconcile two others. This skill is the step back. It takes stock of the code a card has written and refactors it, round after round, until it reads as if it had been designed this way from the start.

Care about the code around the card as well as the card's own. When the card's code is awkward because an abstraction beside or beneath it is wrong or missing, improving that abstraction is in scope, along with its other callers. Keep that proportionate: a wider change serves the card's code, and the loop does not rewrite areas the card only passes through.

The aim is less code that is easier to change. On a large feature that has been through many rounds, halving the code it added is often a reasonable ambition. Treat that as a prompt to look hard, not a quota: some code is already as small as it should be, and cutting it further would make it worse. Judge each change by whether the next person to read the code will find it simpler.

If you don't already have this card's context, establish it first by following `.agents/docs/card-context.md`.

### Scope

The scope is everything the card's branch changed against its base, product code and tests, or the area the user names. It extends to nearby code where that is what makes the card's code simpler:

- an existing helper or component the card's code should reuse rather than copy;
- an abstraction the card's code had to work around, reshaped so it no longer has to;
- a missing abstraction the card's code needs, introduced with the existing code that does the same job moved onto it.

Keep each wider change to one clear idea, so a reviewer can follow it, and record in the ledger why it was needed.

### Ground rules

- **Behaviour does not change.** Not what the product does, not its copy, not how it looks or feels, not its API responses or data. A refactor round never fixes a bug, adds a feature or restyles anything. A bug found while refactoring goes in the plan for a fix round, with a failing test where it is substantive.
- **Shorter must also be clearer.** No code golf: no dense ternary chains, no cryptic names, no packing several steps into one expression to save lines. A refactor that saves lines and costs clarity is reverted.
- **Look for the abstraction the code is missing.** Code that does nearly the same job in several places often wants one shape, with the differences as data or options. Two things that only look alike, and change for different reasons, stay apart.
- **Weigh risk against the gain.** Tests and the proof in step 5 bring risk down, so a clearly simpler result is worth doing with tests written first. A marginal gain in code that is hard to cover is not.
- **The tests stay green, and keep their meaning.** Run them before and after every refactor. A test may be rewritten when the internals it reached into are gone, against the public entry point that replaced them. A test is never deleted or loosened to get a refactor through.
- **Count every line, and judge by the net.** A new helper, hook or file counts against what it replaces, and so do the tests written to guard a refactor. An entry that does not bring the net down is reverted, unless it buys a clarity the ledger names. A package whose total is not down has missed its purpose, however many entries it ticked.
- **Guard refactors with few, sharp tests.** Write the smallest test that would catch the regression the entry risks, at the public entry point. Where existing tests already pin the behaviour, write none.
- **Commit per refactor**, each with its line count before and after, so any one can be reverted alone.
- **Set the model on every agent.**
  - Fable for the judgements that are architecture or taste: the altitude survey, and triage calls on what to unify or redesign.
  - Opus for the other surveys, the adversarial review in step 5, and any refactor that restructures (a new state owner, a merged module, an altitude redesign). Left to a mechanical pass, a restructure comes back as a new layer beside the old code, and the count goes up.
  - Sonnet for mechanical entries: a rename, a helper adopted at many sites, a deletion.

### 1. Measure

Record a baseline in the plan's refactor ledger (create the section if the plan has none):

- lines added and removed by the branch, product code and tests separately (`git diff --numstat <base>...HEAD`);
- the largest files the branch added or grew;
- how many files, components, hooks and modules the branch added.

### 2. Survey with fresh eyes

Brief three or four agents that have not seen the build, each with the whole scope and a different lens. Always include altitude: the other lenses only find what can be merged or deleted in place, so on their own they settle for small savings. Each returns candidates, every one naming the files, what would replace them, an estimate of the lines saved, and the risk to behaviour.

- **Duplication:** components, hooks, queries and logic that do the same job in several places; per-case branches that could be a table of data; tests that repeat each other's setup or assertions.
- **Reuse:** code that rebuilds something the codebase already has (a component, a utility, a query helper, a test helper). Search the codebase for each new helper's job before accepting that it needed writing.
- **Structure:**
  - layers that only pass values through;
  - state held in two places and reconciled;
  - options, parameters and branches nothing uses;
  - defensive handling of states that cannot occur;
  - modules split so finely that one change touches five files, or merged so broadly that one file does five jobs.
- **Altitude:** for each area the scope touches (a screen, a flow, a subsystem), how many lines would a from-scratch implementation of the same behaviour take, written by someone who knew the whole behaviour up front? Where the gap is large, sketch that design and say what it replaces. The other lenses find copies; this one finds code shaped by the order it was written in, which is where most of a large feature's excess hides after many rounds of fixes.
- **Dead weight:** exports with no callers, code left behind by an earlier design, comments that narrate rather than explain, and types that restate what inference already gives.

### 3. Triage into a ledger

Merge the candidates into the plan's refactor ledger. For each, take one of these decisions and give its reason:

- **Do:** the result is simpler and the behaviour is covered by tests.
- **Do, with tests first:** the result is simpler, but the behaviour it touches is not yet covered. Write the tests before refactoring.
- **Leave:** the result would be harder to understand, the code only looks alike and changes for different reasons, or the gain is marginal against its risk.

Where two candidates compete, such as an altitude redesign against a string of merges in place, take the one whose result is simpler.

Order the work by saving against risk. Group it by area: a screen, a flow, a subsystem. Each package owns its area whole, product code and tests together, so no entry is blocked by a file just outside its list. Run areas in parallel only where they share no files; otherwise run them in turn.

Each package rewrites its area's tests alongside the code. It merges coverage that repeats, turns repeated cases into tables, and folds the guard tests it writes into those tables, so the area's tests come out smaller as well.

### 4. Refactor

Each package agent works from its ledger entries, commits per refactor, and runs the checks the repository uses (typecheck, lint, the tests that cover the code it touched, the build where UI changed). It reports lines before and after for each entry, and the package's net for product code and tests. It also reports anything it chose not to do, with the reason.

When a package comes back short of its ledger estimate, find out why before the next round: an estimate that was wrong, a new file that ate the saving, or tests-first that outgrew the code they guard. Put the lesson in the next round's briefs.

### 5. Prove behaviour unchanged

A green suite is necessary but not enough, because tests cover only what someone thought to test.

- **Review** each package with a fresh agent briefed adversarially. It hunts for behaviour that changed: a lost edge case, a reordered side effect, a changed default, an error that now surfaces differently, a query that now returns more or fewer rows. It also flags any refactor that made the code harder to read. Fix its findings and re-review the fixes.
- **Screens:** where the UI changed, re-shoot the states the build's screenshots cover and compare them with the shots from before the round. Any visible difference is a regression to fix, not a decision to take.
- **Backend:** re-run any exploratory probes and matrices the card has, such as access checks, races and failure injection. Any change in an answer is a regression.

### 6. Loop

Measure again and record the new numbers in the ledger. Then survey again with agents that did not survey or refactor before: each round's changes open up candidates that were hidden behind the old structure.

Stop when two consecutive fresh surveys find nothing worth doing: their candidates are all decided as Leave, or together they would save only a small fraction of what remains. Running out of time does not end the loop; the stop condition does.

### 7. Report

Lead with the numbers, before and after, for product code and tests. Then give:

- the main structural changes, one line each;
- what was left alone deliberately, and why;
- any bugs found along the way, and where they were recorded.

### Never

- Change behaviour, copy or visuals in a refactor round.
- Fix a bug inside a refactor commit.
- Delete or loosen a test to get a refactor through.
- Merge two things into one abstraction because they look alike, when they change for different reasons.
- Rewrite code the card only passes through, for its own sake.
- Trade clarity for fewer lines.
- Refactor code the tests do not cover without writing those tests first.
