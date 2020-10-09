/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const Script = require('./Script');

const PACKAGE_DIR = 'packages';

/**
 * Usage: `node  testAll [-b|--bail] [-s|--silent]`
 *
 * Options:
 * -b|--bail: bail mode (exit on first failure)
 * -s|--silent: silent mode (do not print output from the tests)
 */
class TestAllScript extends Script {
  packages;

  run() {
    this.printEnabledOptionsInfo();
    this.packages = this.findPackages();
    const results = this.runTests();
    this.printResults(results);

    this.exit(this.getScriptResult(results));
  }

  parseOptions(args) {
    return {
      bailMode: args.includes('-b') || args.includes('--bail'),
      silentMode: args.includes('-s') || args.includes('--silent'),
    };
  }

  printEnabledOptionsInfo() {
    if (this.options.bailMode) {
      this.log('Bail mode is on');
    }
    if (this.options.silentMode) {
      this.log('Silent mode is on');
    }
  }

  findPackages = () =>
    this.findFolders(PACKAGE_DIR)
      .filter(folder => this.checkPathExists(`${PACKAGE_DIR}/${folder.name}/package.json`))
      .map(({ name }) => name);

  /**
   * @returns {Object<string, bool>}
   */
  runTests = () => {
    // Simulate a CI environment (do not run tests in "watch' mode etc)
    process.env.CI = true;
    process.env.FORCE_COLOR = true;

    this.log('Running tests for all packages...');

    const results = {};
    this.packages.forEach(packageName => {
      results[packageName] = this.runTest(packageName);
    });
    return results;
  };

  runTest = packageName => {
    if (!this.options.silentMode) {
      this.log(`\n${packageName}`);
    }
    const result = this.exec(`yarn workspace @tupaia/${packageName} test`, {
      printOutput: !this.options.silentMode,
    });
    if (this.options.silentMode) {
      // No test output in `silentMode`, so we can print the results as we get them
      this.printPackageResult(packageName, result);
    }

    if (!result && this.options.bailMode) {
      this.logError('\nA failing package was found, exiting');
      this.exit(false);
    }
    return result;
  };

  printPackageResult = (packageName, passesTests) => {
    const logResult = passesTests ? this.logSuccess : this.logError;
    const symbol = passesTests ? '✓' : '✗';
    logResult(`  ${symbol} ${packageName}`);
  };

  printResults = results => {
    this.log();

    if (!this.options.silentMode) {
      this.log('Results\n');
      Object.entries(results).forEach(([packageName, result]) => {
        this.printPackageResult(packageName, result);
      });
      this.log();
    }

    const failCount = Object.values(results).filter(x => !x).length;
    if (failCount > 0) {
      this.logError(`${failCount} packages have failing tests`);
    } else {
      this.logSuccess('All packages pass tests!');
    }
  };

  getScriptResult = results => Object.values(results).every(x => x);
}

new TestAllScript().run();
