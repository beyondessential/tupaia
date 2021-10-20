/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { ArithmeticConfigCellBuilder } from '../../../../../apiV2/export/exportSurveys/cellBuilders';
import { ARITHMETIC_TEST_CASES, QUESTIONS } from './fixtures';
import { processArithmeticConfig } from '../../../../../apiV2/import/importSurveys/ConfigImporter/processArithmeticConfig';
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

const runTestCase = async testCase => {
  const { config } = testCase;
  const input = {
    arithmetic: await processArithmeticConfig(modelsStub, convertCellToJson(config)),
  };
  const expected = config;

  const builtConfig = await arithmeticConfigCellBuilder.build(input);
  console.log(builtConfig);

  return expect(builtConfig).to.equal(expected);
};

describe('configCellBuilders', () => {
  describe('ArithmeticConfigCellBuilder', () => {
    ARITHMETIC_TEST_CASES.forEach(testCase => {
      it(testCase.description, async () => {
        await runTestCase(testCase);
      });
    });
  });
});
