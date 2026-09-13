/*
 * TEMPORARY DIAGNOSTIC — remove once TUP-3193’s renderer crash is understood.
 *
 * Console only: read it over `chrome://inspect` with DevTools attached, which retains what it has
 * already received even when the renderer dies. Filter the console on `tup3193`.
 */

export const crashLog = (event: string, data?: Record<string, unknown>) => {
  console.debug('[tup3193]', event, data ?? '');
};

/**
 * A snapshot of everything cheap enough to sample on a timer.
 *
 * `performance.memory` reports the V8 heap only — it cannot see PGlite’s WASM memory, which is
 * sampled separately in the worker (see pglite.worker.ts).
 */
export const sampleRuntime = (extra?: Record<string, unknown>) => {
  const memory = (performance as unknown as { memory?: Record<string, number> }).memory;

  crashLog('sample', {
    ...(memory && {
      heapUsedMb: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      heapTotalMb: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      heapLimitMb: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
    }),
    domNodes: document.getElementsByTagName('*').length,
    ...extra,
  });
};

/** Total number of handlers registered across every event type on a mitt emitter. */
export const countEmitterHandlers = (emitter: unknown) => {
  const all = (emitter as { all?: Map<unknown, unknown[]> } | undefined)?.all;
  if (!all) return undefined;
  let total = 0;
  all.forEach(handlers => {
    total += handlers.length;
  });
  return total;
};
