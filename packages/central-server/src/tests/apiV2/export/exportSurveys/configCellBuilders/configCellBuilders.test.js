/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import {
  ArithmeticConfigCellBuilder,
  ConditionConfigCellBuilder,
} from '../../../../../apiV2/export/exportSurveys/cellBuilders';
import { ARITHMETIC_TEST_CASES, CONDITION_TEST_CASES, QUESTIONS } from './fixtures';
import { processArithmeticConfig } from '../../../../../apiV2/import/importSurveys/ConfigImporter/processArithmeticConfig';
import { processConditionConfig } from '../../../../../apiV2/import/importSurveys/ConfigImporter/processConditionConfig';
import { convertCellToJson } from '../../../../../apiV2/import/importSurveys/utilities';

const generateModelsStub = () => {
  const findByIdStub = sinon.stub().returns(null);
  findByIdStub
    .withArgs(sinon.match(sinon.match.any))
    .callsFake(inputId => QUESTIONS.find(({ id }) => id === inputId) || null);

  const findIdByCodeStub = sinon.stub().returns(null);
  findIdByCodeStub
    .withArgs(sinon.match(sinon.match.any))
    .callsFake(inputCodes =>
      QUESTIONS.filter(({ code }) => inputCodes.includes(code)).reduce(
        (acc, { code, id }) => ({ ...acc, [code]: id }),
        {},
      ),
    );

  return {
    question: {
      findById: findByIdStub,
      findIdByCode: findIdByCodeStub,
    },
  };
};

const modelsStub = generateModelsStub();
const arithmeticConfigCellBuilder = new ArithmeticConfigCellBuilder(modelsStub);
const conditionConfigCellBuilder = new ConditionConfigCellBuilder(modelsStub);

const runArithmeticTestCase = async testCase => {
  const { config } = testCase;
  const input = {
    arithmetic: await processArithmeticConfig(modelsStub, convertCellToJson(config)),
  };
  const expected = config;

  const builtConfig = await arithmeticConfigCellBuilder.build(input);

  return expect(builtConfig).to.equal(expected);
};

const runConditionTestCase = async testCase => {
  const { config } = testCase;
  const input = {
    condition: await processConditionConfig(modelsStub, convertCellToJson(config)),
  };
  const expected = config;

  const builtConfig = await conditionConfigCellBuilder.build(input);

  return expect(builtConfig).to.equal(expected);
};

describe('configCellBuilders', () => {
  describe('ArithmeticConfigCellBuilder', () => {
    ARITHMETIC_TEST_CASES.forEach(testCase => {
      it(testCase.description, async () => {
        await runArithmeticTestCase(testCase);
      });
    });

    it('Question codes are substrings of one another', async () => {
      const config = 'formula: $baba * $ab + $bab + $abab + $abbaba + ($ba * 2) - $abbababa';
      const expectedProcessedFormula =
        '$mnbv * $zx + $kjh + $oiuy + $sdffgh + ($cv * 2) - $dfglkjyt';

      const processedConfig = await processArithmeticConfig(modelsStub, convertCellToJson(config));
      expect(processedConfig.formula).to.equal(expectedProcessedFormula);

      const builtConfig = await arithmeticConfigCellBuilder.build({
        arithmetic: processedConfig,
      });

      return expect(builtConfig).to.equal(config);
    });
  });
  describe('ConditionConfigCellBuilder', () => {
    CONDITION_TEST_CASES.forEach(testCase => {
      it(testCase.description, async () => {
        await runConditionTestCase(testCase);
      });
    });
  });
});
