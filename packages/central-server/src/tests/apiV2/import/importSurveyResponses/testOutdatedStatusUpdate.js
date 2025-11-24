/* eslint-disable camelcase */

import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;

import {
  buildAndInsertSurveys,
  findOrCreateDummyCountryEntity,
  generateId,
  SurveyResponseOutdater,
} from '@tupaia/database';
import { TestableApp } from '../../../testUtilities';
import { importFile } from './helpers';

const SURVEYS = {
  // Survey details match the import spreadsheet
  Test_Yearly: {
    id: generateId(),
    name: 'Test Yearly',
    code: 'Test_Yearly',
    period_granularity: 'yearly',
    // Question ids are padded with `0`s to comply with the expected id length
    questions: [{ id: 'yearly_test_000000000000', code: 'Test_Yearly', type: 'Number' }],
  },
  Test_Monthly: {
    id: generateId(),
    name: 'Test Monthly',
    code: 'Test_Monthly',
    period_granularity: 'monthly',
    questions: [{ id: 'monthly_test_00000000000', code: 'Test_Monthly', type: 'Number' }],
  },
  Test_No_Granularity: {
    id: generateId(),
    name: 'Test No Granularity',
    code: 'Test_No_Granularity',
    period_granularity: undefined,
    questions: [{ id: 'no_granularity_test_0000', code: 'Test_No_Granularity', type: 'Number' }],
  },
};

export const testOutdatedStatusUpdate = () => {
  const app = new TestableApp();
  const { models } = app;
  const surveyResponseOutdater = new SurveyResponseOutdater(models);
  surveyResponseOutdater.setDebounceTime(50); // short debounce time so tests run more quickly

  /**
   * Asserts that newly imported responses for a survey have the expected `outdated` statuses.
   * Statuses should follow the ascending id order of their corresponding survey responses:
   * for newly created responses, this should match the column order in the import spreadsheet
   */
  const assertOutdatedStatuses = async (surveyCode, expectedOutdatedStatuses) => {
    const surveyResponses = await models.surveyResponse.find(
      { survey_id: SURVEYS[surveyCode].id },
      { sort: ['id'] },
    );
    const wrongCountMessage = `Count of survey responses for survey "${surveyCode}" must match that of the provided outdated statuses`;
    expect(surveyResponses).to.have.lengthOf(expectedOutdatedStatuses.length, wrongCountMessage);

    for (let i = 0; i < surveyResponses.length; i++) {
      const surveyResponse = surveyResponses[i];

      const entity = await models.entity.findById(surveyResponse.entity_id);
      const srDescriptionFields = {
        survey_code: surveyCode,
        entity_code: entity.code,
        data_time: surveyResponse.data_time,
      };
      const message = `Failed assertion for survey response ${JSON.stringify(srDescriptionFields)}`;

      expect(surveyResponse).to.have.property('outdated', expectedOutdatedStatuses[i], message);
    }
  };

  before(async () => {
    await app.grantFullAccess();
    await buildAndInsertSurveys(models, Object.values(SURVEYS));
    await findOrCreateDummyCountryEntity(models, { code: 'TO', name: 'Tonga' });
    await findOrCreateDummyCountryEntity(models, { code: 'VU', name: 'Vanuatu' });
  });

  beforeEach(async () => {
    await models.surveyResponse.delete({ survey_id: Object.values(SURVEYS).map(s => s.id) });
    surveyResponseOutdater.listenForChanges();
  });

  afterEach(async () => {
    surveyResponseOutdater.stopListeningForChanges();
  });

  after(() => {
    app.revokeAccess();
  });

  it('importing new survey responses using a mix of surveys, entities and timestamps', async () => {
    const response = await importFile(
      app,
      'outdatedStatus.xlsx',
      Object.values(SURVEYS).map(s => s.code),
    );

    expect(response.statusCode).to.equal(200, response.error.text);

    await models.database.waitForAllChangeHandlers();
    // Statuses listed in the same order as the corresponding survey responses in the import spreadsheet
    await assertOutdatedStatuses('Test_Yearly', [true, true, false, false, false, false]);
    await assertOutdatedStatuses('Test_Monthly', [true, true, false, false, false, false]);
    // Responses for non periodic surveys are never "outdated"
    await assertOutdatedStatuses('Test_No_Granularity', [false, false, false, false, false, false]);
  });
};
