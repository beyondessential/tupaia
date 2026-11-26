---
workhorse-version: 0.7.2
---

# Building a surface to a reference standard

A base prompt for a large, polished piece of product work: a surface people use all day that has to feel as good as the best tool they know. It is the detailed method behind `hands-free-feature`, which runs it end to end without check-ins. Verification, meaning bug hunts, reviews, browser checks and feel passes, is its own skill, `qa-loop`, and this playbook leaves that method to it. For taste, feel and how to critique a design, read `.agents/docs/design-judgement.md`, which this playbook does not repeat.

Fill in the block below in the plan. Everything after the brief is how to work.

## The brief (fill in per card)

- **Card and surface:** {card code}, {the surface: the card board, the project roadmap, ...}.
- **The ask, in the user's words:** {quote it; it is the standard you are held to}.
- **Reference product:** {the product that does this best}. Screenshots: {paths}. Docs worth fetching: {URLs}.
- **Decisions already made:** {list; do not reopen them}.
- **Out of scope:** {list}.
- **Delivery:** one PR on this card unless the brief says otherwise.
- **Phase to stop at:** {design only, or design then build}.

## The bar

"Work really well, buttery smooth, completely free of bugs." Turn that into checks you can fail:

- An interaction that stays on the page shows its result within a frame or two: under about 50 ms locally, under about 100 ms on Fast 3G with 4x CPU throttling.
- A route change shows feedback within about 100 ms and content within about 200 ms locally.
- Nothing shifts once painted. Cumulative layout shift stays at or below 0.01 on a reload.
- Every action is reachable by keyboard, focus is never lost to the page body, and a screen reader hears what changed.
- Nothing the user typed or did is lost on a refusal, a reload, a second tab or a dropped connection.
- Side by side with the reference, a person cannot point at something that looks unconsidered.

Only a browser proves the first four. Code review proves none of them. `.agents/docs/browser-rig.md` is how to get one. The server side has its own bar: every entry point refuses what the caller may not do, survives hostile input, concurrency and an external service failing, and every bug found has a test (see "Backend exploration loops").

## Roles and economy

- **You orchestrate.** Make decisions, write briefs with settled decisions, triage findings, review. Do not read large files into your own context when an agent can report the conclusion.
- **Subagents do the volume.** Pass `model` on every Agent call: left unset, each agent inherits your own model and the run costs several times what it should. `qa-loop` has the table of which model suits which job. In short, Sonnet for implementation, surveys, spikes, mockups and routine review; Haiku for running commands and collating reports; Opus for hard adversarial reasoning; Fable sparingly, where taste or an architecture decision is the work.
- **Launch independent agents together** and act on their reports as they land.
- **Expect to be cut off.** Usage limits end sessions mid-flight, and a session that ends stops every agent still running. Everything that matters lives on disk: commit per item, have every agent write findings to a file as it goes, and keep a log that a fresh session can resume from. Relaunch a cut-off agent with "a previous run was cut off; check `git log` and `git status` and build on what is there". Run work you are waiting on as a foreground agent rather than ending your turn on a background one.

## Phase 1: design and specify, with no production code

1. **Orient.** Read the shipped implementation of the surface first. An agent surveys the current code, the specs that govern it and the reference product's docs, and reports where they differ. Read the existing specs yourself.
2. **Ask for references at the start, and wait for them before any visual decision.** Write a wishlist into the plan: each item names the state to capture (a row hovered, a menu open, an empty state) and the decision it settles. Ask the user for captures and do the non-visual work while they come. A wishlist that is written and never sent produces a design from memory, which is polished for hours before anyone sees it is wrong.
3. **Spike the risky technology and the hardest interaction.** Throwaway code outside the repo, with numbers: volumes, latencies, browser behaviour, and frame rate for the most demanding interaction at target scale with 4x CPU. Record results and blockers in the plan. A spike that finds a bundler bug costs an hour; the same bug found after the build costs a redesign. Skipping it tends to end with an expensive approach, such as restyling every element on each animation frame, and several performance rounds to undo it.
4. **Edit the specs** to describe the system as it should be, folding into existing specs before creating new ones. Resolve every open question before the spec is called done.
5. **Mock up from a capture or the build, never from imagination.** Start from a capture of the reference or the shipped screen. Where the reference does not settle the direction, produce three structurally different directions from separately briefed agents and choose by critique (design judgement, "Diverge, then converge"). Screenshot each beside the reference. The chosen mockup is the contract the build is compared with every round. A build treated as its own mockup means nothing visual is compared with anything until the user steps in.
6. **Write the technical design** into the plan as types and schemas, not prose: data contracts, endpoints and their access rules, how writes flow and roll back, how the UI reads. Fix the read hooks' signatures early, so the UI can be built against a simple implementation and the data layer swapped underneath later without touching components. Keep one source of truth per piece of state. Three optimistic layers plus a fourth to reconcile them means every later fix has to reason about all four.
7. **Write work packages** (format below), test cases marked automated or manual with the package that writes each, and a review checklist ordered by what is most likely to go wrong, each item saying how to check it.
8. **Review your own output** with a fresh-eyes subagent that has none of your context, fix what it finds, then show the user.

## Design principles

The general method for taste and feel is in `.agents/docs/design-judgement.md`. These are specific calls that held up under a user's eye, and then the ones that did not.

**What worked**

- **Restraint is the reference's main quality.** Copy it. Fewer elements per row, one list rather than tabs, no advanced modes until someone asks. A priority split the reference does not have is the first thing a user cuts.
- **An accent budget, written down.** Name the exact places the accent may appear and make everything else neutral: the send control when ready, the border of a reaction the viewer added, the unread badge. Avatars without photos go neutral app-wide.
- **Bare muted icons, not discs.** Event marks as 16px muted glyphs in a fixed column with a rail between them.
- **Folds keep the first and last line** and name what is inside ("Show 5 events: changed status, priority").
- **Measure alignment in the build.** Take DOM rects at 2x and make shared edges and baselines equal by number: avatar columns, text columns, control centres, gaps. Then redraw the mockups to match the build, so the mockups stay a true record.
- **A keyboard model, specified.** The focus ring shows on keyboard use only. A menu takes focus when it opens, arrows walk it, Esc returns focus to the opener, and Tab closes it. When an action removes the focused row, focus goes to the next one.
- **Optimistic writes that never visibly undo themselves.**
  - The React key survives the swap from temporary id to server id, so the node is never recreated.
  - Pending work dims with `aria-busy` and no spinner.
  - A refusal restores the exact prior state, including the row's position, shows one toast naming the action, and puts typed text back in the box.
- **Paint a section once.** Hold a section until its parts are ready, with a short cap, so the first paint does not shove anything. Draw the composer in the same frame as the timeline above it.
- **Accessibility as its own review.**
  - Live regions exist before their text is written, and are cleared when the thing they announced goes.
  - State is in words for screen readers ("Unread", "Snoozed until …").
  - Every icon button has a name.
  - Contrast is checked on every ground a row can sit on (selected, hovered), not only the page.

**What did not work**

- **Mockups designed fresh.** They came out noisier than the reference, heavy on the accent, and misaligned. Grounding them in the build and the reference fixed all three.
- **Designing from memory of the reference.** A roadmap tinted every bar with its project's colour and set the names inside, where the reference's bars were neutral with the names above and colour only in the icons. An overnight polish loop refined the wrong design.
- **Route-level `loading.tsx` skeletons.** In a React app with Suspense, the fallback throttle added about 300 ms to every fast open. What replaced them:
  - An in-page skeleton shown only after about 150 ms.
  - The route's JavaScript warmed by hidden fully prefetched links, since a payload prefetch does not fetch the chunks.
  - A pending pulse on the clicked link after 100 ms.
- **Key hints in placeholders.** Surfaces do not advertise their own keys.
- **Exact measurements in specs.** They belong in mockups and the design system.

## Phase 2: build through work packages

Each package is a self-contained brief a cheaper model can finish without asking anything:

- **Goal**, **Depends on**, **Specs** it satisfies.
- **Read first:** real paths.
- **Changes:** files to create and change, with exact types and function signatures, and what to reuse.
- **Tests** required, by kind, with the commands.
- **Pitfalls** specific to the package.
- **Done when:** a literal list. If a line cannot be met, the agent writes why under a "Blocked" heading and moves to the next package that does not depend on it.

A shared README carries the rules every package follows. Take them from the repository's own `CLAUDE.md` and `AGENTS.md`: environment variables not to set, the test database, how migrations are numbered and written, rules for scripts and configuration, which build to run after which kind of change, and how to commit. State them once, there, so no package restates them differently.

Order the packages so protocol and data land first, the UI is built against the stable hooks, and the data layer swaps in late. After each package, run a QA loop scoped to it (the `qa-loop` skill), and answer its findings with a fix package whose decisions are settled, so the implementer never sets policy.

## Phase 3: verification is a loop, not a pass

The method lives in the `qa-loop` skill: adversaries by lens, triage, fixers, a different agent re-checking the fixes, regression tests for everything found, and a stopping rule built on consecutive clean rounds. What this playbook adds is the lessons it was distilled from:

- **A round is not closed until its fixes are re-reviewed.** Deferring that until the user asks is how a high-severity security issue (dates past year 9999 stored and breaking a page workspace-wide) and two regressions from a fix that dropped a revalidation surfaced late.
- **Re-review the fixes adversarially.** One re-review found 22 problems in the fixes, including a security regression, a stream that failed open on an unanswered access check, which came from the orchestrator's own brief. Put every settled decision through a security lens before it goes out.
- **Prefer a policy fix to a parameter tweak.** Widening a replay window from 100 to 1,000 still lost rows. Replaying in broadcast order closed the gap.
- **Structural refactors found late become follow-up cards.** Do the cheap guards now: a lint rule for the client and server boundary, a digest guard on a versioned schema, one home for shared constants.
- **An automated reviewer** on a diff of hundreds of files is shallow. Use it as a final gate, not as the loop.

## Phase 4: the polish loop

Run it unattended, round and round, until a pass produces nothing worth doing.

- **A log file is the loop's memory**, under the card's plan folder. It holds two tracks, each with a queue, a done list with commit hashes, and a "noticed, not done" list. Any session resumes from it.
- **Each iteration is one small agent task** that commits per item and appends to the log.
- **Feature rounds and polish rounds are separate, and both loop.** A feature round walks the jobs, then decides what to add, change or cut, in a batch of one to three, each built through its own design, review and polish. A polish round only subtracts and corrects. Features added inside fix and polish rounds (hover dates, an off-screen marker, narrow layouts, remembered scroll, keyboard menus app-wide) get no design, no walkthrough and none of the reviews they needed, and their fixes reach into a dozen shared components. Deciding features is welcome; doing it inside a polish round is the mistake. See design judgement, "Deciding features".
- **The design track** follows design judgement's UI loop: one change per iteration, before and after side by side, a taste ledger so the loop does not oscillate. It works against the reference screenshots, the user's comments, the design system, and the app's own restraint. Its items: the accent budget, alignment surface by surface, hover bars, the composer, folds, empty states and notices. It ends with a side-by-side comparison and a closing list of every remaining difference, each marked to fix or to keep with the reason.
- **The code track:**
  - Split modules by responsibility, and tests over about 400 lines.
  - Keep one formatter for each concern.
  - Remove comments narrating history ("now", "used to") and dead code.
  - Replace fixed sleeps in tests with mocked timers or wait-until helpers.
- **Checkpoint every few iterations:** typecheck, lint, the full suite against a database, and the production build. Then push.

## Phase 5: feel sweeps in a real browser

A browser finds the bugs that matter most, and code review finds none of them: a section painting twice, the composer pushed under the dock, Back losing the selection, a skeleton adding 300 ms to every open, a hydration mismatch redrawing a list after paint, focus dropped to the page body, rows reshuffling on Back, a refused action leaving a row in the wrong place.

Setup, flows and reporting are in `.agents/docs/browser-rig.md` and the browser lens of `qa-loop`. The flows for a surface usually number about a dozen: a cold open on a slow link; a warm open; keyboard-only triage; create, edit and delete; two users live at once; a server restart mid-session; Back and forward; a reload; sign-out and sign-in as someone else; a refused action; reaching an item through search.

## Backend exploration loops

Code review reads the server side; walkthroughs reach it through the UI. Neither drives it directly with the inputs and timing that break it. The QA loop's API adversary and edge-case lenses probe each batch's endpoints; these loops explore the server side as a whole, across every entry point the feature touches, with the same persistence as the polish loop and interleaved with it. Findings take the QA loop's shape and its triage, fix and re-check steps.

**The seed.** Keep an edge-case seed in the rig alongside the walkthrough seed:
- names that differ only by case or collide after normalising;
- unicode and maximum-length names;
- the largest counts the product allows;
- records shared between owners, and records owned by someone else;
- deleted, moved and archived records;
- legacy rows shaped by the previous release;
- one user at every access level.

Restore it before every run, as the browser rig does.

**Two harnesses.**
- **HTTP:** call routes and server actions over HTTP against the production build, with a session for each user. Server actions are usually reachable through the same request the browser sends (in Next.js, a POST carrying the `Next-Action` header), so a probe can replay a recorded request.
- **Functions:** call the plain functions behind the actions from a small script against the rig database. This is quicker for a matrix and reaches code the UI never calls with odd arguments.

**What to try, per entry point:**
- **Access:** each level in the access matrix, and an id from another workspace or owner. A refusal must say nothing about a thing the caller cannot see.
- **Input:** empty values, the maximum and one past it, unicode, case variants, `../` and encoded slashes in anything that becomes a path or a URL, and a value valid for another tenant.
- **Concurrency:** fire the same write twice with `Promise.all`; race conflicting writes, such as set and unset, add and remove, or change and delete. Afterwards the data must be consistent and every caller must have had a definite answer.
- **Failure:** stop or slow the fake external service, make it answer 5xx or 403, restart the server mid-operation, and replay a request whose first response was lost.
- **State:** run the operation against legacy rows, against a record mid-transition, and at the counts the product allows.

**Every finding becomes a test.** Write the reproduction as a failing unit or database integration test first, then fix. Probes are throwaway; the test is what keeps the finding fixed. Turn the exploration's best probes into permanent tests too, even where they found nothing, when they cover a path no test reached.

**Stop** when a full pass over every entry point finds nothing above low, and every finding from earlier passes has a test that failed before its fix.

## Running parallel agents in one worktree

- **Commits.** Each agent commits only its own paths with `git commit -F <file> -- <paths>`. Never `--amend`, never `git add -A`, never `git stash`. Re-read a file before editing it, since another agent may have committed to it.
- **Fence the shared components.** Name in the plan the shared components the work may change. Changing any other one needs a reason and a before-and-after screenshot of every place it appears.
- **Partition by area.** Split fix agents by area, and name in each brief the files the others own. Commit early, since an automatic commit at the end of a turn can sweep staged files into it.
- **Brief contents.** Every brief carries:
  - the working directory;
  - "read `CLAUDE.md` first";
  - the environment rules and the DB URL;
  - what the other agents are doing;
  - the commit prefix;
  - what to run before reporting;
  - the reply shape.
- **Verify what agents claim.** "Reproduced on paper" means not run. Test cases get ticked for tests that do not exist. A re-review should check the test-cases file against real test names.

## Keeping the branch landable

- **Merge the base branch often.** Expect migration numbers to collide, and renumber yours.
- **Expect semantic conflicts.** A new enum member from the base needs an entry in every exhaustive map on your branch.
- **After a merge**, reinstall dependencies and regenerate any generated clients before trusting a test run. Files that fail because a client regenerated mid-run pass on a rerun.
- **CI is not your machine.** CI may run an older runtime than this machine, with globals it lacks. Get the real failure from the CI log by searching for the failing test line; the log tail rarely shows it.
- **Fix the flakes you introduced:** unawaited closes, global sweeps in tests, timing assertions. Rerun known flakes rather than "fixing" them.
- **Keep the PR description current:**
  - hand-authored migrations;
  - anything renumbered or edited in place;
  - release blockers you could not verify, such as other browsers and private windows;
  - failures specific to your machine, so a reviewer is not told to expect them in CI.
- **Revise the card's progress summary** at each milestone.
