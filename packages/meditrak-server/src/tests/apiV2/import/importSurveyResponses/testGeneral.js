/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  buildAndInsertSurveys,
  findOrCreateDummyCountryEntity,
  findOrCreateRecords,
} from '@tupaia/database';
import { expect } from 'chai';
import { expectError, TestableApp } from '../../../testUtilities';
import { importFile } from './helpers';
import { BASIC_SURVEY_A, BASIC_SURVEY_B } from './importSurveyResponses.fixtures';

export const testGeneral = async () => {
  const app = new TestableApp();
  const { models } = app;

  let basicSurveyA;
  let basicSurveyB;

  before(async () => {
    await app.grantFullAccess();

    await findOrCreateDummyCountryEntity(models, { code: 'DL', name: 'Demo Land' });
    const entities = ['DL_1', 'DL_5', 'DL_7', 'DL_9'].map(code => ({
      code,
      country_code: 'DL',
    }));
    await findOrCreateRecords(models, { entity: entities });
    await buildAndInsertSurveys(models, [BASIC_SURVEY_A, BASIC_SURVEY_B]);

    basicSurveyA = await app.models.survey.findOne({ code: 'Test_Basic_Survey_A' });
    basicSurveyB = await app.models.survey.findOne({ code: 'Test_Basic_Survey_B' });
  });

  afterEach(async () => {
    await models.surveyResponse.delete({ survey_id: [basicSurveyA.id, basicSurveyB.id] });
  });

  after(async () => {
    await app.revokeAccess();
  });

  describe('selecting tabs to import', () => {
    it('imports specified tab', async () => {
      const response = await importFile(app, `general/basic.xlsx`, ['Test_Basic_Survey_A']);
      expect(response.status).to.equal(200);
    });

    it('imports multiple specified tabs', async () => {
      const response = await importFile(app, `general/basic.xlsx`, [
        'Test_Basic_Survey_A',
        'Test_Basic_Survey_B',
      ]);
      expect(response.status).to.equal(200);
    });

    it('makes sure tabs exist matching the survey codes specified', async () => {
      const response = await importFile(app, `general/basic.xlsx`, [
        'A_Survey_Code_That_Is_Not_Specified_In_Spreadsheet_Tabs',
      ]);
      expectError(response, /specified in import but there is no tab named/, 400);
    });

    it('detects survey codes via tab names if not present in query', async () => {
      const response = await importFile(app, `general/basic.xlsx`, []); // surveyCodes empty
      expect(response.status).to.equal(200);
    });

    it('only imports against surveys present in query', async () => {
      const response = await importFile(app, `general/basic.xlsx`, ['Test_Basic_Survey_A']);
      expect(response.status).to.equal(200);

      const surveyResponsesA = await app.models.surveyResponse.find({ survey_id: basicSurveyA.id });
      const surveyResponsesB = await app.models.surveyResponse.find({ survey_id: basicSurveyB.id });

      expect(surveyResponsesA.length).to.equal(1);
      expect(surveyResponsesB.length).to.equal(0);
    });
  });
};
