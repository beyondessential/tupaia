---
workhorse-version: 0.7.2
---

# Design judgement

How to decide what a feature should do, how to tell a crafted interface from a generated one, and how to move a design from the second to the first. The skills `hands-free-feature` and `qa-loop` depend on it, and it applies to any UI review. The workspace's design system, where it has one (`.workhorse/design/design-system.md` or the repo's own), sets the tokens and the rules and wins wherever it disagrees; this document covers the judgement that rules do not.

## Deciding features

Choosing what to build takes the same judgement as choosing how it looks, and it loops just as hard. It happens in feature rounds, kept apart from polish rounds, so each addition gets its own design, review and polish.

**Start from jobs, not features.** List the three to six jobs the surface exists for, each with who does it, when, and what done looks like. A feature is worth building only if it makes one of those jobs faster, more certain, or possible at all. Completeness is not a reason, and neither is the reference having it ("theirs is pretty extra").

**Find candidates by doing the jobs.** Walk each job in the running build with realistic data, as each kind of user, and time it and count its steps. Candidates come from:

- a job that is slow, uncertain or impossible;
- a moment where you wanted something that was not there, or reached for a control that did something else;
- what the reference does for the same job;
- the backlog from earlier rounds.

**Judge each candidate before building it:**

- **Which job, and what evidence?** Name the job, and the walkthrough moment that showed the need.
- **Change before add.** Can an existing element do it? Revealing dates on hover beats adding a dates column, and a better default beats a new setting.
- **Count the cost.** Count the new surfaces, states, keys, settings and shared components it brings, and the review and polish each will need. A feature that touches shared components across the app usually belongs in a card of its own.
- **Does it keep the surface quiet?** If it adds visible chrome to every row, it needs a strong reason.
- **Would the user miss it?** If no walkthrough would have gone worse without it, leave it out.

**Cut as readily as you add.** A control no walkthrough used, a setting with only one sensible value, two ways to do the same thing: cut them, and record why.

**Decide in small batches.** Take one to three items per feature round, so each one gets its full path: spec, design, build, review, polish. Then walk the jobs again. Keep a change that made its job better by the walkthrough's own measure, revert one that did not, and record both. Raise the bar for adding with each round. The first rounds settle the shape, and the later ones mostly refine and cut.

**Stop** when a full walkthrough of every job finds nothing worth adding, changing or cutting.

## The default you are working against

A model asked for an interface produces the average of the interfaces it has seen, and people recognise that average as made by AI within a second. It is rarely ugly. It is undecided: every element gets equal care, so nothing leads. These are its tells. Look for them in your own work first, because you will have produced some.

- **Colour as decoration.**
  - Tinted backgrounds on cards, bars, rows and badges.
  - A colour per category whether or not anyone needs to tell them apart.
  - The accent on anything clickable.

  On one roadmap, every bar was tinted with its project's colour and carried the name inside. The reference's bars were neutral, the name sat above the bar, and colour appeared only in the small project icon.
- **Boxes around everything.** Cards inside panels inside sections, each with a border, a radius and padding. Rows boxed rather than separated by space.
- **Labels for the self-evident.** "Status:", section headings over a single item, helper text under fields, hint text explaining what a control plainly does.
- **A pill for every attribute.** Usually the value as plain muted text reads better.
- **An icon beside every word.** Icons belong where they replace a word or mark a type, not where they repeat a label.
- **Size doing the work of hierarchy.** Five type sizes on one surface, big headings over small content.
- **Even everything.** The same spacing, the same weight, and the same emphasis on every element. Everything centred. No rhythm and no focal point.
- **Density the wrong way round.** Generous padding in a list someone scans all day, and cramped text on a page someone reads.
- **Chrome that competes with content.**
  - Toolbars of icon-and-text buttons.
  - Segmented controls for everything.
  - A filled accent button for a routine action. A section's add affordance is a small `+` icon button, not a call to action.
- **Explaining instead of designing.** An illustration and a paragraph on every empty state, a tooltip on every control.
- **Motion as garnish.** Slides, scales and bounces on panels, and fades that hold content back.
- **Edges nobody looked at.**
  - Long names that wrap and break a row.
  - Truncation with no way to see the whole.
  - Single-item and empty states that look broken.
  - Numbers that jitter because they are not tabular.

## What crafted looks like

Each principle comes with the test that tells you whether you have met it.

1. **One thing leads.** Each surface has one focal element, the content the user came for, and everything else recedes. *Test:* blur the screenshot. The shape you can still make out should be the content, not the chrome.
2. **Neutral by default, with colour as information.** *Test:* render the screenshot in greyscale; the hierarchy and every state must survive. Then restore colour and say, for each coloured element, what it tells the user. Remove any element with no answer.
3. **Hierarchy through weight and tone, at few sizes.** Use primary, secondary and muted text at two type sizes, three at most. *Test:* count the distinct font sizes and weights on the surface.
4. **A few strong vertical lines.** Text, icons and controls share a small number of left edges, and items in a row share a baseline. *Test:* compare DOM rects; shared edges agree within half a pixel. Where an icon's weight is uneven, optical alignment beats arithmetic.
5. **Space before lines, lines before boxes.** *Test:* try removing each border and background. Keep only those whose removal makes the grouping ambiguous.
6. **Density matched to the task.**
   - Scanning surfaces (lists, boards, timelines, inboxes) are dense and quiet, with compact rows and small muted metadata.
   - Reading and writing surfaces are airy.
7. **The data is the decoration.** Real names, dates and avatars carry the visual interest. Chrome stays nearly invisible until it is needed: hover reveals actions, focus reveals rings.
8. **Every element earns its place.** *Test, the subtraction pass:* for each element, say what the user loses if it goes. Remove one thing every round, until removing anything makes the surface worse.
9. **Details are where craft shows.**
   - Tabular numerals for dates and counts.
   - Icons at one size and one stroke, optically centred.
   - Hit targets larger than their visuals.
   - The right cursor for each affordance: grab, grabbing, col-resize, and a pointer only on links and buttons.
   - Hover previews what a click will do.
   - Truncated text shows in full on hover.
10. **Every state is designed, not left over.** The states are:
    - empty, loading, a single item, a hundred items;
    - long names, missing data;
    - an error, a disabled control;
    - a narrow window, keyboard focus.

    *Test:* the state matrix below has a screenshot for every cell.
11. **One hand made the whole app.** A new surface should look as if it came from the same designer as the app's best existing ones. Find its two or three best surfaces and match them: same row anatomy, same metadata treatment, same menus and controls.

The workspace's own settled calls come from its design system and from what its people have already corrected. Read them before designing, and do not reopen them.

## Feel

Feel is what an interface is like to use rather than to look at. It lives in individual frames, so that is where you judge it.

- **Response.** Every input shows a result within a frame or two: a hover state, a pressed state, or the change itself, applied optimistically. Nothing waits on the network to show that it heard you.
- **Continuity.** Things keep their identity. A row that moves is seen to move; it does not vanish and reappear. A panel that opens leaves the page beneath it where it was. Scroll position, selection and focus survive every action, a reload and Back.
- **Direct manipulation.**
  - A drag follows the pointer one to one, with no lag.
  - The dragged object shows where it will land and what it will become, for example the new dates while a bar moves.
  - Snapping is visible and firm.
  - Esc cancels.
  - On release it lands exactly where the preview showed.
- **Calm.** Nothing moves unless the user moved it or the world changed, such as another person's edit, and even that arrives quietly. Motion stays inside the design system's limits: short fades and colour changes, no slides, scales or springs.
- **Predictability.** A gesture does the same thing on every surface, and keys do what the rest of the app has taught.
- **Forgiveness.** A refusal puts everything back exactly as it was, position included, and says so once. Typed text is never lost.
- **Precision.** Targets are generous, handles are found without hunting, and the cursor says what will happen.

**How to judge feel:**

- Record a filmstrip of every interaction, one screenshot per frame or a performance trace. Look at each frame for flicker, a double paint, a jump, a flash of empty content, or a frame with both the old and the new state.
- Time each input to its first visible result and measure layout shift. Record the frame rate during drag, scroll and zoom at realistic volume with the CPU throttled 4x.
- Drive the surface by keyboard only, then by trackpad, then at 1024px wide.
- Write each finding as something a person would notice, with the numbers behind it: "the bar trails the pointer by about its own height on a quick drag; 31 ms per frame at 4x CPU".

## Finding a reference

Designing with no reference produces the default. Always have one, in this order of preference:

1. **A capture of a product that does this well**, at each state that matters. A capture gives real measurements, not an impression. Where the workspace can hold captures, such as Workhorse's mockup picker (Capture screen) or the Design area's snapshots, ask the user for them; where it cannot, ask for screenshots. If a `match-linear` skill is present, it has the step-by-step instructions for the user.
2. **The app's own best surfaces**, screenshotted from the running app. A new surface that matches them looks native.
3. **A named precedent from memory, described concretely.** Say what is on each row, where colour appears and what hover does. Treat it as a hypothesis: memory keeps the gist and invents the details, which is how the tinted bars above came out wrong. Ask for a capture to check it.
4. **First principles**, only for parts that are genuinely new.

Ask for references once, at the start. Name each screen and state wanted and the decision it settles, then do non-visual work while you wait.

## Diverge, then converge

The weakest design process is to make one design and polish it. Polish improves execution and never direction, so a loop that polishes its own first idea converges on a refined version of the default.

- **Make three directions first.** Before committing, produce three that differ in structure, not in colour: different layouts, different ways of showing the key information, different interaction models.
  - Brief three agents separately so they do not converge. Give each the reference, the brief and a different stance: the most faithful to the reference, the most minimal, and the one that makes the main task fastest.
  - Mock each one at real size with real data, including the hard cases: a very long name, many items, none.
- **Choose and record.** Critique the three side by side with the protocol below and choose one. Write in the plan why it won and what the others did better, then take those parts deliberately.
- **Go back when the build feels wrong.** Return to divergence for that part rather than polishing harder.

## The critique protocol

Run it on every screenshot round, for mockups and for the build. A critique that says "looks good" or "could be more polished" has failed; it names specific elements and specific changes.

1. **Set up the matrix.**
   - Every state: default, hover, focus, selected, menu open, drag, empty, loading, error, a single item, many items, long names.
   - At every width that matters: 1440px, 1024px and narrow.
   - With realistic data.
2. **Look yourself.** The orchestrator views every screenshot at full size, plus 2x crops of the dense regions. Never delegate the looking.
3. **Run the tests:**
   - blur, greyscale and subtraction;
   - alignment by DOM rects;
   - the count of type sizes and weights;
   - the inventory of colours;
   - the screenshot beside the reference at the same width;
   - the screenshot beside the app's best neighbouring surface.
4. **Record the five-second impression.** Where does the eye land first, second and third, and is that the right order?
5. **Ask the hard question.** Would the design lead of the reference product ship this? If not, name the three things they would change first.
6. **Get a second pair of eyes.** A fresh critic agent that did not author the work receives only the screenshots, the reference and this document. It must list at least ten specific issues ranked by how much each costs the design, or show for each test why the work passes.
7. **Write findings as changes.** "Drop the bar tint: draw bars on `--bg-inset` with a 1px `--border-default`, and move the name above the bar in 12px secondary." Not "the bars are too colourful".

## A worked critique

This is the standard of critique the protocol asks for. It was written against a roadmap as merged, after its visual rework to the reference's neutral bars. The interaction measurements were already good: 60fps drag, scroll and zoom; layout shift 0; a dropped bar moving 0px after release. What remained was visual, and no round of its loop had looked for it.

**Five-second impression.** The eye lands first on the filled orange New project button, then on the orange today chip, then on the coloured project icons repeated down the sidebar and the left column. The bars, which are the content, come fourth. The blur test agrees: what survives is chrome.

**Findings, ranked, each written as a change:**

1. **Make the topbar speak one visual language.** It uses five control styles: a centred text toggle, a bordered Today button, a segmented zoom, an icon button, and a filled accent button.
   - New project becomes a small `+` icon button or quiet text at the far right. The filled accent button breaks the house rule.
   - List · Roadmap moves beside the title, where the app's other view switches sit.
   - Today becomes plain text at the zoom group's left edge.
2. **Take most of the lines out.**
   - Draw month lines at `--border-subtle`, dotted, rather than solid through every row.
   - Drop the tick marks in the header.
   - Status groups become text in the left column with no band ruled across the timeline.
3. **Stop painting blocks over the date row.** Dragging and hovering fill a solid block across it, hiding the day numbers, and a drag shows the dates twice, in the block and beside the bar. Keep the dates beside the bar only, and mark the range in the header with a hairline or a low-alpha tint.
4. **Put words on an undated row.** On hover it shows a faint dashed ghost bar and nothing else. Show a muted line at the start of the lane, "No dates · drag to schedule", as Linear shows "No project dates", and draw the ghost only once a drag begins.
5. **Design the edges.**
   - A label reaching the viewport edge is cut mid-word ("Ward dashboa").
   - A label five times its bar's width runs on across empty months.
   - Instead, clamp labels to the visible lane with an ellipsis and keep them in view while any of their bar is.
6. **Size the peek to what it shows, or fill it with what helps.** It shows five property rows and then about 70% empty white.
   - Fill it with what helps someone decide (the description, recent activity, the cards), or size it to its content.
   - Unset fields read "None". Make them invitations in muted text ("Add lead", "Add labels"), as Linear does.
7. **Let the left column give way at 1024px.** It keeps its full width and takes nearly half the content area. Narrow it with the window, truncating names, down to about 200px.
8. **Backlog, not fixed in this round:** the sidebar lists the same projects as the roadmap's left column. It is real redundancy, but deciding it is a feature call, not polish. It goes on the backlog, and since the sidebar is a shared surface, the feature round will most likely make it a card of its own.

Findings 1, 2 and 6 are visible in a single capture of Linear's timeline, beside a screenshot at the same width. That is why a capture comes first.

## The UI loop

This loop turns a working build into a refined one, and it is where most of a hands-free run's time should go.

1. **Shoot** the state matrix and the interaction filmstrips.
2. **Critique** with the protocol above and rank the findings by how much they cost.
3. **Change one thing.** Take the top finding and make one change, or one tightly related set.
4. **Compare.** Re-shoot the same cells, put before and after side by side, and judge the change better, worse or no different. Keep it or revert it, and never keep a change you have not seen.
5. **Log it in the taste ledger:** the change, the reason, the before and after paths, and the verdict. Do not reopen a ledger decision without new evidence; this is what stops the loop oscillating.
6. **Start fresh every few iterations.** Rerun the subtraction pass and the reference comparison from scratch, and rerun the feel measurements.
7. **Stop only when all of these hold:**
   - two consecutive full critiques, one of them by a fresh critic, find nothing above minor;
   - every feel measurement passes;
   - every difference from the reference is listed with its reason.

Polish rounds subtract and correct; they never add, change or cut a feature. An idea for something new goes on the backlog, and the next feature round decides it.
