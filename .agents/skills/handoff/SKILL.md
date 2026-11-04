---
name: handoff
description: "Generate a context-rich briefing prompt for an external agent (Claude Code, Cursor, etc.)"
label: "Handoff"
category: other
workhorse-version: 0.3.0
---

## Your task: Hand off to an external agent

The user wants to hand off work on this card to an external agent (Claude Code, Cursor, or another AI tool). Generate the briefing prompt in one pass — do not ask the user to confirm focus first.

### What to do

1. **Infer a focus** from the card's current state and conversation history. For example:
   - Specs are drafted and no code yet → focus is "begin implementation"
   - Implementation is in progress → focus is "continue the implementation"
   - There are CI failures or known bugs → focus is "fix the build failures" or "investigate the reported bug"
2. **Compose the full briefing** following the structure below. Write it as instructions addressed to the external agent ("You are picking up work on...").
3. **Deliver it based on length.** The UI renders ```handoff blocks with an **Open in Claude Code** button that launches a local Claude Code terminal session with the block's contents pre-filled (via a `claude-cli://` deep link), alongside the standard copy button. The deep link URL-encodes the block and is capped near 4500 encoded characters, so a full briefing routinely overflows it and disables the button. To avoid that:
   - **If the full briefing is 1000 characters or fewer**, return it inline in a single fenced code block tagged ```handoff. This is the common, short case.
   - **If the full briefing exceeds 1000 characters**, do not inline it. Instead:
     - Write the full briefing to `.workhorse/handoffs/{card-id}/handoff.md` (create the folder if it doesn't exist). Workhorse commits and pushes this file with the card's branch at the end of your turn — you do not commit it yourself.
     - **End the briefing with a cleanup instruction**: once the external agent has read the handoff doc and no longer needs it, it should delete `.workhorse/handoffs/{card-id}/handoff.md` and commit the deletion, since the doc is a transient point-in-time artefact that should not linger on the branch.
     - Return a short **pointer prompt** in a single fenced code block tagged ```handoff. The pointer names the card, tells the external agent to fetch `<card-branch>` and **check it out in a git worktree** (e.g. `git fetch origin` then `git worktree add ../<repo>-{card-id} <card-branch>`) rather than switching branches in the user's working tree, **pulling the latest so the committed `handoff.md` is present** (an existing local branch or worktree may be stale), and directs it to read `.workhorse/handoffs/{card-id}/handoff.md` for its full briefing and follow it. Keep the pointer well under 1000 characters so the deep link always fits.
   - **Critical: whatever you put in the ```handoff block must be a single fenced block with no fenced code blocks (triple backticks) inside it** — nested fences break the outer block and disable both the button and copy. Use inline code with single backticks for paths, commands, and identifiers. The `handoff.md` file itself is exempt: it is a real file, not embedded in a fence, so it may contain fenced code blocks freely.
   - Whether inline or in `handoff.md`, teach the agent how to find information (read the specs, diff the branch) rather than inlining large file contents.
4. **Immediately after the code block**, add a short line naming the focus you inferred and inviting the user to redirect — e.g. "This is for starting implementation of the allergies spec. Let me know if you want it for something else." When you moved the briefing into `handoff.md`, say so in that line.

### Briefing prompt structure

Whether delivered inline or written to `handoff.md`, the briefing contains these sections, in order:

**1. Workhorse context** — explain the spec-driven workflow:
- Specs live in `.workhorse/specs/` as structured markdown with YAML frontmatter and checkbox acceptance criteria
- Describe the system as it should be (not changes to make). Acceptance criteria are facts about behaviour. Include implementation detail only where a reimplementation should be constrained back to that technical choice (e.g. a backend sync healing strategy); keep product-facing and frontend criteria behavioural
- Mockups live in `.workhorse/design/mockups/{card-id}/` as standalone HTML with inline CSS
- Design system is at `.workhorse/design/design-system.md`
- The card's implementation plan lives at `.workhorse/plans/{card-id}/` — a free-form markdown working document with tech design notes and/or a checklist of build steps. Read it first if it exists, tick items (`- [ ]` → `- [x]`) as work completes, and expand steps into sub-items if they turn out larger than anticipated
- Australian/NZ English spelling

**2. Card context** — the card title, identifier, and description (when present)

**3. Branch instructions** — tell the agent to check the card's branch out in a **git worktree** (e.g. `git fetch origin` then `git worktree add ../<repo>-{card-id} <card-branch>`) rather than switching branches in place, so the user's working tree is left undisturbed, and to diff the branch against the upstream base branch to understand what specs and mockups have been added or changed

**4. Journal summary** — summarise what has happened so far on this card based on the conversation history (what was discussed, what decisions were made, what work was done)

**5. Conversation context** — compress the key points from the conversation: decisions made, open threads, areas explored, any unresolved questions. This gives the external agent continuity

**6. Focus instructions** — what the external agent should do, based on the focus you inferred

### Guidelines

- The prompt should be self-contained — the external agent should not need to ask the user for context
- Teach the agent how to find information (read the specs, diff the branch) rather than inlining all file contents
- Keep it concise but complete — aim for a prompt that gets the external agent productive immediately
- Write it as instructions addressed to the external agent ("You are picking up work on...")
