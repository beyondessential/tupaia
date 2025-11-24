import {
  buildAndInsertSurveys,
  findOrCreateDummyCountryEntity,
  findOrCreateRecords,
} from '@tupaia/database';
import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { expectError, TestableApp } from '../../../testUtilities';
import { importFile } from './helpers';
import { BASIC_SURVEY_A, BASIC_SURVEY_B } from './importSurveyResponses.fixtures';

const expectNumResponses = async (models, surveyId, expectedNumResponses) => {
  const surveyResponses = await models.surveyResponse.find({ survey_id: surveyId });
  expect(surveyResponses.length).to.equal(expectedNumResponses);
};

export const testGeneral = async () => {
  const app = new TestableApp();
  const { models } = app;

  let basicSurveyA;
  let basicSurveyB;

  before(async () => {
    await app.grantFullAccess();

    await findOrCreateDummyCountryEntity(models, { code: 'DL', name: 'Demo Land' });
    const entities = [
      { code: 'DL_1', name: 'Port Douglas' },
      { code: 'DL_5', name: 'Hawthorn East' },
      { code: 'DL_7', name: 'Lake Charm' },
      { code: 'DL_9', name: 'Thornbury' },
    ].map(entity => ({
      ...entity,
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
      await expectNumResponses(models, basicSurveyA.id, 1);
      await expectNumResponses(models, basicSurveyB.id, 0);
    });

    it('imports multiple specified tabs', async () => {
      const response = await importFile(app, `general/basic.xlsx`, [
        'Test_Basic_Survey_A',
        'Test_Basic_Survey_B',
      ]);
      expect(response.status).to.equal(200);
      await expectNumResponses(models, basicSurveyA.id, 1);
      await expectNumResponses(models, basicSurveyB.id, 1);
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
      await expectNumResponses(models, basicSurveyA.id, 1);
      await expectNumResponses(models, basicSurveyB.id, 1);
    });
  });
};
