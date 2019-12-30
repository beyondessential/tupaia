/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { executeCommand } from '../helpers';

/**
 * @typedef {Array<{ fileName, text }>} MatchData
 */

const MOCHA_TEST_BLOCKS = ['it', 'describe', 'context', 'specify'];
const STD_ERROR_CODE = 1;
const TEST_DIR = 'src/tests';

export const validateNoExclusiveTestsExist = async () => {
  const regexp = MOCHA_TEST_BLOCKS.map(testBlock => `${testBlock}.only`).join('\\|');
  const grepOutput = await grep(regexp, TEST_DIR);
  const matchData = getMatchData(grepOutput);

  if (matchData.length > 0) {
    throw new Error(
      ['Exclusive tests found in the following locations:', ...formatMatchData(matchData)].join(
        '\n',
      ),
    );
  }
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
 * @returns {MatchData}
 */
const getMatchData = grepOutput => {
  return grepOutput.split('\n').reduce((result, line) => {
    if (line.length === 0) {
      return result;
    }

    const [fileName, text] = line.split(/:(.*)+/);
    return result.concat([{ fileName, text: text.trim() }]);
  }, []);
};

/**
 * Formats matched data by aligning them in columns
 *
 * @param {MatchData} matchData
 * @returns {MatchData}
 */
const formatMatchData = matchData => {
  const fileNameSuffix = ':';
  const fileNameColumnLength =
    Math.max(...matchData.map(({ fileName }) => fileName.length)) + fileNameSuffix.length;

  return matchData.map(({ fileName, text }) => {
    const formattedFileName = fileName.concat(fileNameSuffix).padEnd(fileNameColumnLength, ' ');
    return `${formattedFileName}    ${text}`;
  });
};
