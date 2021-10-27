/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const ARITHMETIC_TEST_CASES = [
  {
    description: 'minimal',
    config: 'formula: 1',
  },
  {
    description: 'Question code translation',
    config: 'formula: $question_1_code + $question_2_code + ($question_1_code * 2)',
  },
];

// export const ARITHMETIC_TEST_CASES = ARITHMETIC_TEST_CASES_2.map(({ description, config }) => ({
//   description,
// }));
