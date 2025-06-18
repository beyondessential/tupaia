const stacks = require('../../packages/devops/configs/server-stacks.json');

/**
 * @param {string[]} stackNames
 */
function mergeStacks(stackNames) {
  const packages = new Set();
  for (const stackName of stackNames) {
    const stack = stacks[stackName];
    if (stack === undefined) continue;
    for (const pkg of stack) packages.add(pkg);
  }
  return [...packages].sort();
}

/**
 * Silently ignores invalid stack names.
 *
 * `--pretty` implies `--json`. Both take precedence over `--as-glob`.
 *
 * @privateRemarks
 * Not using our custom `Script` or `yargs` as it more than doubles the run time
 * of this script.
 */
function main() {
  const args = process.argv.slice(2);
  const flags = {
    prettyPrint: args.includes('--pretty'),
    printJson: this.prettyPrint || args.includes('--json'),
    printGlob: args.includes('--as-glob'),
  };

  const stackNames = args.filter(s => !s.startsWith('--'));
  const packages = mergeStacks(stackNames);

  if (flags.prettyPrint) {
    console.log(JSON.stringify(packages, null, 2));
    return;
  }
  if (flags.printJson) {
    console.log(JSON.stringify(packages));
    return;
  }
  if (flags.printGlob) {
    console.log(`{${packages.join(',')}}`);
    return;
  }

  console.log(packages.join(' '));
}

main();
