/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const CONDITION_TEST_CASES = [
  {
    description: 'minimal',
    config: 'conditions: Yes:1 > 0,No:0 > 1',
  },
  {
    description: 'Question code translation',
    config:
      'conditions: more:$question_1_code > $question_2_code,less:$question_1_code < $question_2_code,equal:$question_1_code = $question_2_code',
  },
  {
    description: 'Handles defaultValues (order not guaranteed)',
    config:
      'conditions: more:$question_1_code > $question_2_code,less:$question_1_code < $question_2_code,equal:$question_1_code = $question_2_code\r\ndefaultValues: more.question_1_code:1,more.question_2_code:1,less.question_1_code:0,less.question_2_code:0,equal.question_1_code:2,equal.question_2_code:2',
  },
];
