import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;

import { processArithmeticConfig } from '../../../../../apiV2/import/importSurveys/ConfigImporter/processArithmeticConfig';
import { convertCellToJson } from '../../../../../apiV2/import/importSurveys/utilities';
import { assertCanProcessAndBuild, cellBuilderModelsStub } from './utilities';
import { ANSWER_TYPES } from '../../../../../database/models/Answer';

const QUESTIONS = [
  {
    code: 'question_1_code',
    id: 'question_1_id',
    validationCriteria: 'mandatory: true',
    type: ANSWER_TYPES.NUMBER,
  },
  {
    code: 'question_2_code',
    id: 'question_2_id',
    validationCriteria: 'mandatory: true',
    type: ANSWER_TYPES.NUMBER,
  },
  {
    code: 'ab',
    id: 'zx',
    type: ANSWER_TYPES.NUMBER,
  },
  {
    code: 'ba',
    id: 'cv',
    type: ANSWER_TYPES.NUMBER,
  },
  {
    code: 'bab',
    id: 'kjh',
    type: ANSWER_TYPES.NUMBER,
  },
  {
    code: 'abab',
    id: 'oiuy',
    type: ANSWER_TYPES.NUMBER,
  },
  {
    code: 'baba',
    id: 'mnbv',
    type: ANSWER_TYPES.NUMBER,
  },
  {
    code: 'abbaba',
    id: 'sdffgh',
    type: ANSWER_TYPES.NUMBER,
  },
  {
    code: 'abbababa',
    id: 'dfglkjyt',
    type: ANSWER_TYPES.NUMBER,
  },
  {
    code: 'arithmetic_question',
    id: 'arithmetic_question_id',
    type: ANSWER_TYPES.ARITHMETIC,
  },
];

const assertCanProcessAndBuildArithmetic = config =>
  assertCanProcessAndBuild(QUESTIONS, 'arithmetic_question', config);

describe('ArithmeticConfigCellBuilder', () => {
  it('minimal', async () => {
    await assertCanProcessAndBuildArithmetic('formula: 1');
  });

  it('Question code translation', async () => {
    await assertCanProcessAndBuildArithmetic('formula: $question_1_code + $question_2_code');
  });

  it('Duplicate question code translation', async () => {
    await assertCanProcessAndBuildArithmetic(
      'formula: $question_1_code + $question_2_code + ($question_1_code * 2)',
    );
  });

  it('defaultValues work', async () => {
    await assertCanProcessAndBuildArithmetic(
      'formula: $question_1_code\r\ndefaultValues: question_1_code:0',
    );
  });

  it('multiple defaultValues work', async () => {
    await assertCanProcessAndBuildArithmetic(
      'formula: $question_1_code + $question_2_code\r\ndefaultValues: question_1_code:0,question_2_code:1',
    );
  });

  it('valueTranslations work', async () => {
    await assertCanProcessAndBuildArithmetic(
      'formula: $question_1_code\r\nvalueTranslation: question_1_code.Yes:0,question_1_code.No:1',
    );
  });

  it('multiple valueTranslations work', async () => {
    await assertCanProcessAndBuildArithmetic(
      'formula: $question_1_code\r\nvalueTranslation: question_1_code.Yes:0,question_1_code.No:1,question_2_code.Yes:3,question_2_code.No:4',
    );
  });

  it('answerDisplayText works', async () => {
    await assertCanProcessAndBuildArithmetic(
      'formula: $question_1_code + $question_2_code + ($question_1_code * 2)\r\nanswerDisplayText: Modified question_1_code equals $result',
    );
  });

  it('All work together (Order not preserved)', async () => {
    await assertCanProcessAndBuildArithmetic(
      'formula: $question_1_code + $question_2_code + ($question_1_code * 2)\r\ndefaultValues: question_1_code:0,question_2_code:2\r\nvalueTranslation: question_1_code.Yes:0,question_1_code.No:1,question_2_code.Yes:3,question_2_code.No:4\r\nanswerDisplayText: Modified question_1_code equals $result',
    );
  });

  it('Question codes are substrings of one another', async () => {
    const config = 'formula: $baba * $ab + $bab + $abab + $abbaba + ($ba * 2) - $abbababa';
    const expectedProcessedFormula = '$mnbv * $zx + $kjh + $oiuy + $sdffgh + ($cv * 2) - $dfglkjyt';

    const processedConfig = await processArithmeticConfig(
      cellBuilderModelsStub(QUESTIONS),
      convertCellToJson(config),
    );
    expect(processedConfig.formula).to.equal(expectedProcessedFormula);
  });
});
