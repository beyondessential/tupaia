/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { ArithmeticConfigCellBuilder } from '../../../../apiV2/export/exportSurveys/cellBuilders';

const QUESTIONS = [
  {
    code: 'hi',
    id: 'test_1',
  },
];

const generateArithmeticConfig = () => {
  return {
    formula: '1',
  };
};

describe('configCellBuilders', () => {
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

  // const assertSurveyNameGeneratesCode = async (surveyName, expectedResult) => {
  //   const result = await findOrCreateSurveyCode(modelsStub, surveyName);
  //   expect(result).to.equal(expectedResult);
  // };
  describe('ArithmeticConfigCellBuilder', () => {
    it('works', async () => {
      const config = generateArithmeticConfig();
      const builtConfig = await arithmeticConfigCellBuilder.build(config);
      console.log(builtConfig);
    });
  });
});
