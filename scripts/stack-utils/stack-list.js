const { parseArgs } = require('node:util');
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
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // TODO: print available stacks
  }

  const {
    values: { pretty, json, 'as-glob': glob },
    positionals: stackNames,
  } = parseArgs({
    args,
    options: {
      'as-glob': { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
      join: { type: 'boolean' },
      json: { type: 'boolean' },
      pretty: { type: 'boolean' },
    },
    allowPositionals: true,
  });

  const packages = mergeStacks(stackNames);

  if (pretty) {
    console.log(JSON.stringify(packages, null, 2));
    return;
  }
  if (json) {
    console.log(JSON.stringify(packages));
    return;
  }
  if (glob) {
    console.log(`{${packages.join(',')}}`);
    return;
  }

  console.log(packages.join('\n'));
}

main();
