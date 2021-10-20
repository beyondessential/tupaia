/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { ArithmeticConfigCellBuilder } from '../../../../../apiV2/export/exportSurveys/cellBuilders';
import { ARITHMETIC_TEST_CASES, QUESTIONS } from './fixtures';

const generateModelsStub = () => {
  const findByIdStub = sinon.stub().returns(null);
  findByIdStub
    .withArgs(sinon.match(sinon.match.any))
    .callsFake(inputId => QUESTIONS.find(({ id }) => id === inputId) || null);

  return {
    question: { findById: findByIdStub },
  };
};

const modelsStub = generateModelsStub();
const arithmeticConfigCellBuilder = new ArithmeticConfigCellBuilder(modelsStub);

const runTestCase = async testCase => {
  const { input, expected, throws } = testCase;
  // const { indicatorCodes, fetchOptions } = input;

  // const builtConfig = await arithmeticConfigCellBuilder.build(input);

  const expectedPromise = arithmeticConfigCellBuilder.build(input);
  console.log(input, await expectedPromise);

  if (throws) {
    return expect(expectedPromise).toBeRejectedWith(expected);
  }
  await expect(expectedPromise).resolves.toStrictEqual(expected);
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
