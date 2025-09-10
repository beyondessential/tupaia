#!/usr/bin/env node

const Script = require('@tupaia/utils');

const PACKAGE_DIR = 'packages';

class TestAllScript extends Script {
  config = {
    options: {
      bail: {
        alias: 'b',
        type: 'boolean',
        description: 'Exit on first failure',
      },
      silent: {
        alias: 's',
        type: 'boolean',
        description: 'Dot not print output from the tests',
      },
    },
    version: '1.0.0',
  };

  packages;

  runCommands() {
    this.printEnabledOptionsInfo();
    this.packages = this.findPackages();
    const results = this.runTests();
    this.printResults(results);
    this.exit(this.getScriptResult(results));
  }

  printEnabledOptionsInfo() {
    if (this.args.bail) {
      this.logInfo('Bail mode is on');
    }
    if (this.args.silent) {
      this.logInfo('Silent mode is on');
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
    if (!this.args.silent) {
      this.log(`\n${packageName}`);
    }

    let passesTests = true;
    try {
      this.exec(`yarn workspace @tupaia/${packageName} test`, {
        printOutput: !this.args.silent,
      });
    } catch (error) {
      passesTests = false;
    }

    if (this.args.silent) {
      // No test output in `silentMode`, so we can print the results as we get them
      this.printPackageResult(packageName, passesTests);
    }

    if (!passesTests && this.args.bail) {
      this.logError('\nA failing package was found, exiting');
      this.exit(false);
    }
    return passesTests;
  };

  printPackageResult = (packageName, passesTests) => {
    const logResult = passesTests ? this.logSuccess : this.logError;
    const symbol = passesTests ? '✓' : '✗';
    logResult(`  ${symbol} ${packageName}`);
  };

  printResults = results => {
    this.log();

    if (!this.args.silent) {
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

  getScriptResult = results => Object.values(results).every(Boolean);
}

new TestAllScript().run();
