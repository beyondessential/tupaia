/*
 * `Object.hasOwn` (ES2022) arrived in Chrome 93 / Safari 15.4. DataTrak runs on low-spec Android
 * devices whose system WebView can be older than that, and Vite only transpiles *syntax* — it
 * never polyfills built-in methods, whatever `build.target` is set to.
 *
 * We can't just stop calling it: it comes from es-toolkit, which uses it inside `groupBy`, `pick`,
 * `remove`, `isEqualWith` and a dozen others. `groupBy` alone is enough to kill initial sync
 * ("Object.hasOwn is not a function") via @tupaia/sync's saveIncomingChanges and
 * getDependencyOrder. Every other ES2022+ built-in we relied on was our own code, and has been
 * rewritten in place instead of polyfilled.
 *
 * This has to be its own module imported at the top of main.tsx rather than a few lines inside it:
 * ES module imports are hoisted, so any statement in main.tsx would run *after* the modules that
 * need the polyfill have already been evaluated.
 */
if (typeof Object.hasOwn !== 'function') {
  Object.defineProperty(Object, 'hasOwn', {
    // hasOwnProperty throws the spec's TypeError for null/undefined on our behalf
    value: (object: unknown, key: PropertyKey) =>
      Object.prototype.hasOwnProperty.call(object, key),
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

export {};
