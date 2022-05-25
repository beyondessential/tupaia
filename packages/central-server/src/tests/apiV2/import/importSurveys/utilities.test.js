/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import {
  findOrCreateSurveyCode,
  MAX_SURVEY_CODE_GENERATION_ATTEMPTS,
} from '../../../../apiV2/import/importSurveys/utilities';

describe('import surveys utilities', () => {
  describe('findOrCreateSurveyCode', () => {
    const SURVEYS = [
      { name: 'Existing Survey', code: 'ES' },
      { name: 'Custom Code', code: 'CUSTOM_CODE' },
      { name: 'Numeric Suffix', code: 'NS' },
      { name: 'Numeric Gap', code: 'NG' },
      { name: 'Numeric Gap2', code: 'NG2' },
      { name: 'Numeric Gap4', code: 'NG4' },
      { name: 'Available Initials', code: 'AI2' },
    ];
    for (let i = 1; i <= MAX_SURVEY_CODE_GENERATION_ATTEMPTS; i++) {
      SURVEYS.push({ name: `Repeated Survey ${i}`, code: `RS${i > 1 ? i : ''}` });
    }

    const generateModelsStub = () => {
      const findOneStub = sinon.stub().returns(null);
      findOneStub
        .withArgs(sinon.match({ name: sinon.match.any }))
        .callsFake(({ name: inputName }) => SURVEYS.find(({ name }) => name === inputName) || null)
        .withArgs(
          sinon.match({
            code: sinon.match.any,
            name: { comparator: '<>', comparisonValue: sinon.match.any },
          }),
        )
        .callsFake(({ code: inputCode, name: { comparisonValue: inputName } }) =>
          SURVEYS.find(({ code, name }) => (code === inputCode && name !== inputName) || null),
        );

      return {
        survey: { findOne: findOneStub },
      };
    };

    const modelsStub = generateModelsStub();

    const assertSurveyNameGeneratesCode = async (surveyName, expectedResult) => {
      const result = await findOrCreateSurveyCode(modelsStub, surveyName);
      expect(result).to.equal(expectedResult);
    };

    it('should use the initials of each word in the survey name', async () => {
      await assertSurveyNameGeneratesCode('Survey', 'S');
      await assertSurveyNameGeneratesCode('Basic Survey', 'BS');
    });

    it('should use the existing code for an existing survey', async () => {
      await assertSurveyNameGeneratesCode('Existing Survey', 'ES');
      await assertSurveyNameGeneratesCode('Custom Code', 'CUSTOM_CODE');
    });

    it('should use a numeric suffix if another survey uses the same code', async () => {
      await assertSurveyNameGeneratesCode('Existing Survey_New', 'ES2');
    });

    it('should use the first available numeric suffix', async () => {
      await assertSurveyNameGeneratesCode('Numeric Suffix_New', 'NS2');
      await assertSurveyNameGeneratesCode('Numeric Gap_New', 'NG3');
    });

    it('should not use a numeric suffix if the name initials are available', async () => {
      await assertSurveyNameGeneratesCode('Available Initials_New', 'AI');
    });

    it('should throw an error after a max number of attempts', () =>
      expect(findOrCreateSurveyCode(modelsStub, 'Repeated Survey_New')).to.be.rejectedWith(
        /Maximum .*attempts/,
      ));
  });
});
