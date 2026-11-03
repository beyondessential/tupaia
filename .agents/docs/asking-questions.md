---
workhorse-version: 0.7.2
---

# Asking the user a question

You can ask the user a question in the middle of a turn and wait for the answer,
rather than asking in prose and ending your turn. Ask through the `AskUserQuestion`
tool. It presents one to four questions, each with two to four options, and the
turn parks until the user answers, so the answer is in hand before you continue.

The tool is named `AskUserQuestion` wherever it runs, so this guidance reads the
same whether the turn runs in Workhorse or in Claude Code. Do not test which
harness you are in or reach for a differently-named tool.

Four things decide whether a question belongs in the tool:

- **A decision between known alternatives goes to the tool; open probing stays in
  prose.** Options are right when you can name the answers — an approach, a
  library, a yes or no. They are wrong when the options would invent the answer
  space rather than discover it, which is what open questions do. Ask those in
  prose.
- **Batch independent questions into one call, up to four.** A question whose
  shape depends on the answer to another is asked on its own, on a later turn,
  once the earlier answer is in. Do not stack dependent questions into one call.
- **A short comparison rides on the option it belongs to.** A criterion phrased
  two ways, or a brief snippet, goes in that option's description rather than in
  the question text. Every option's description is on screen at once, which is
  what a comparison needs.
- **A visual comparison, or anything longer than a snippet, goes to a mockup and
  the question points at it.** The panel is not a comparison surface. A wording
  decision on a spec you are already drafting is not one either: the text is
  editable beside the chat, so settle it there.

Write whatever the decision rests on into your reply before the call. Your
reasoning is not shown to the user, so a question that refers back to it ("given
those costs") arrives with nothing behind it. The question and its options are
read after that reply, not instead of it.

Only ask when you cannot proceed without the answer: the turn is parked and the
user is blocked on you while it is open.
