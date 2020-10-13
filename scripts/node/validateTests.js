#!/usr/bin/env node

/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

const fs = require('fs');
const path = require('path');

const { executeCommand, getLoggerInstance } = require('./utilities');

/**
 * @typedef {Array<{ fileName, text }>} ExclusiveTest
 */

const PACKAGE_ROOT = path.resolve(`${__dirname}/../../packages`);
const TEST_PATHS_RELATIVE_TO_PACKAGE = ['src/tests', 'src/__tests__', 'tests', '__tests__'];
const MOCHA_TEST_BLOCKS = ['it', 'describe', 'context', 'specify'];
const STD_ERROR_CODE = 1;

const findTestDirs = () => {
  const packageNames = fs.readdirSync(`${PACKAGE_ROOT}`);
  return packageNames
    .map(packageName => findPossibleTestDirsForPackage(packageName))
    .flat()
    .filter(fs.existsSync);
};

const findPossibleTestDirsForPackage = packageName =>
  TEST_PATHS_RELATIVE_TO_PACKAGE.map(
    relativeTestPath => `${PACKAGE_ROOT}/${packageName}/${relativeTestPath}`,
  );

const findExclusiveTests = async testDirectory => {
  const regexp = MOCHA_TEST_BLOCKS.map(testBlock => `${testBlock}.only`).join('\\|');
  const grepOutput = await grep(regexp, testDirectory);
  return parseGrepOutput(grepOutput);
};

const grep = async (regexp, directory) => {
  let output = '';
  try {
    output = await executeCommand(`command grep -r '${regexp}' '${directory}'`);
  } catch (error) {
    // We don't throw std_error since it just means that no match was found
    if (error.code !== STD_ERROR_CODE) {
      throw error;
    }
  }

  return output;
};

/**
 * @param {string} grepOutput The output of `grep` command containing file names and matched text.
 * Example:
 * ```js
 * `
 * src/tests/testName.test.js:  matchedText1
 * src/tests/longerTestName.test.js:  matchedText2
 * `
 * ```
 * @returns {ExclusiveTest}
 */
const parseGrepOutput = grepOutput => {
  return grepOutput.split('\n').reduce((result, line) => {
    if (line.length === 0) {
      return result;
    }

    const [fileName, text] = line.split(/:(.*)+/);
    return result.concat([
      {
        fileName: fileName.replace(/.*tupaia\//, ''),
        text: text.trim(),
      },
    ]);
  }, []);
};

/**
 * Formats matched data by aligning them in columns
 *
 * @param {ExclusiveTest} exclusiveTests
 * @returns {ExclusiveTest}
 */
const formatExclusiveTests = exclusiveTests => {
  const fileNameSuffix = ':';
  const fileNameColumnLength =
    Math.max(...exclusiveTests.map(({ fileName }) => fileName.length)) + fileNameSuffix.length;

  return exclusiveTests.map(({ fileName, text }) => {
    const formattedFileName = fileName.concat(fileNameSuffix).padEnd(fileNameColumnLength, ' ');
    return `${formattedFileName}    ${text}`;
  });
};

const logger = getLoggerInstance();

const run = async () => {
  const exclusiveTests = [];

  const runForTestDir = testDir =>
    findExclusiveTests(testDir)
      .then(results => {
        exclusiveTests.push(...results);
      })
      .catch(error => {
        logger.error(error.message);
        process.exit(1);
      });

  Promise.all(findTestDirs().map(runForTestDir)).then(() => {
    if (exclusiveTests.length > 0) {
      logger.error('❌ Exclusive tests found:');
      logger.error(formatExclusiveTests(exclusiveTests).join('\n'));
      process.exit(1);
    } else {
      logger.info('✔ All tests are valid!');
      process.exit(0);
    }
  });
};

run();
