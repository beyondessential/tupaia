/**
 * Captures console output during database startup, so that it can be shown on the failure screen.
 *
 * Startup problems have shown up on low-spec devices and in emulators, where the usual ways of
 * reading a log — remote DevTools, `adb logcat` — either aren’t available or aren’t available to
 * whoever is holding the device. PGlite reports what it is doing (whether it ran `initdb` or
 * resumed an existing database, and anything `initdb` itself printed) through `console`, so
 * intercepting that is enough to get the useful detail in front of the person seeing the error.
 */

/**
 * Kept from the start and the end of the log respectively, with anything in between dropped.
 *
 * A plain ring buffer would be no use here: at high `PG_LITE_DEBUG_LEVEL`s, PGlite logs every
 * protocol message, which would push the early startup lines — the ones that say what it decided
 * to do — out of the buffer long before the failure arrives.
 */
const MAX_HEAD_ENTRIES = 200;
const MAX_TAIL_ENTRIES = 300;

/** Long enough for a stack trace, short enough that a base64 image can’t fill the screen */
const MAX_ENTRY_LENGTH = 2_000;

const LEVELS = ['log', 'info', 'warn', 'error', 'debug'] as const;

type Level = (typeof LEVELS)[number];

const head: string[] = [];
const tail: string[] = [];
let droppedCount = 0;

let originals: Partial<Record<Level, (...args: unknown[]) => void>> | null = null;

const formatArg = (arg: unknown) => {
  if (typeof arg === 'string') return arg;
  if (arg instanceof Error) return arg.stack ?? arg.message;
  try {
    return JSON.stringify(arg);
  } catch {
    // Circular, or something else JSON can’t take — the type is still a useful breadcrumb
    return String(arg);
  }
};

const record = (level: Level, args: unknown[]) => {
  const formatted = args.map(formatArg).join(' ');
  const entry = `[${level}] ${
    formatted.length > MAX_ENTRY_LENGTH ? `${formatted.slice(0, MAX_ENTRY_LENGTH)}…` : formatted
  }`;

  if (head.length < MAX_HEAD_ENTRIES) {
    head.push(entry);
    return;
  }

  tail.push(entry);
  if (tail.length > MAX_TAIL_ENTRIES) {
    tail.shift();
    droppedCount += 1;
  }
};

export const startCapturingStartupLog = () => {
  if (originals) return; // already capturing

  originals = {};
  for (const level of LEVELS) {
    // Keep the function itself rather than a bound copy, so that stopping restores console to
    // exactly what it was; otherwise each start/stop cycle would wrap another layer
    const original = console[level];
    originals[level] = original;
    console[level] = (...args: unknown[]) => {
      record(level, args);
      original.apply(console, args);
    };
  }
};

export const stopCapturingStartupLog = () => {
  if (!originals) return;

  for (const level of LEVELS) {
    const original = originals[level];
    if (original) console[level] = original;
  }
  originals = null;
};

export const getStartupLog = () =>
  [
    ...head,
    ...(droppedCount > 0 ? [`… ${droppedCount} lines omitted …`] : []),
    ...tail,
  ].join('\n');
