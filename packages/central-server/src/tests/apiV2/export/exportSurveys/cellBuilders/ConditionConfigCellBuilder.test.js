import { ANSWER_TYPES } from '../../../../../database/models/Answer';
import { assertCanProcessAndBuild, assertThrowsWhenBuilding } from './utilities';

const QUESTIONS = [
  {
    id: 'q1',
    code: 'question_1_code',
    validationCriteria: 'mandatory: true',
    type: ANSWER_TYPES.NUMBER,
  },
  {
    id: 'q2',
    code: 'question_2_code',
    validationCriteria: 'mandatory: true',
    type: ANSWER_TYPES.NUMBER,
  },
  {
    id: 'q3',
    code: 'question_3_code',
    validationCriteria: 'mandatory: false',
    type: ANSWER_TYPES.NUMBER,
  },
  {
    id: 'q4',
    code: 'question_4_code',
    validationCriteria: 'mandatory: false',
    type: ANSWER_TYPES.NUMBER,
  },
  {
    id: '123',
    code: 'condition_question',
    type: ANSWER_TYPES.CONDITION,
  },
];

const assertCanProcessAndBuildCondition = config =>
  assertCanProcessAndBuild(QUESTIONS, 'condition_question', config);

const assertThrowsWhenBuildingCondition = (config, error) =>
  assertThrowsWhenBuilding(QUESTIONS, 'condition_question', config, error);

describe('ConditionConfigCellBuilder', () => {
  describe('validation', () => {
    it('throws if non-mandatory qs do not have default values', async () => {
      await assertThrowsWhenBuildingCondition(
        'conditions: more:$question_3_code > $question_4_code,less:$question_3_code < $question_4_code,equal:$question_3_code = $question_4_code',
        /Invalid content for field "defaultValues" causing message "Should not be empty if any questions used in the formula are optional"/,
      );
    });
  });

  it('minimal', async () => {
    await assertCanProcessAndBuildCondition('conditions: Yes:1 > 0,No:0 > 1');
  });

  it('Question code translation', async () => {
    await assertCanProcessAndBuildCondition(
      'conditions: more:$question_1_code > $question_2_code,less:$question_1_code < $question_2_code,equal:$question_1_code = $question_2_code',
    );
  });

  it('Handles defaultValues (order not guaranteed)', async () => {
    await assertCanProcessAndBuildCondition(
      'conditions: more:$question_3_code > $question_4_code,less:$question_3_code < $question_4_code,equal:$question_3_code = $question_4_code\r\ndefaultValues: more.question_3_code:1,more.question_4_code:1,less.question_3_code:0,less.question_4_code:0,equal.question_3_code:2,equal.question_4_code:2',
    );
  });
});
