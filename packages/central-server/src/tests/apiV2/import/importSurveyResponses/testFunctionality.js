import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import groupBy from 'lodash.groupby';
import pick from 'lodash.pick';
import moment from 'moment';

import {
  buildAndInsertSurveys,
  findOrCreateDummyCountryEntity,
  findOrCreateDummyRecord,
  findOrCreateRecords,
} from '@tupaia/database';
import { resetTestData, TestableApp } from '../../../testUtilities';
import { importValidFile } from './helpers';
import {
  createSurveyResponses,
  CLINIC_DATA_SURVEY,
  FACILITY_FUNDAMENTALS_SURVEY,
  NON_PERIODIC_RESPONSES_AFTER_UPDATES,
  PERIODIC_RESPONSES_AFTER_UPDATES,
  WEEKLY_SURVEY,
  YEARLY_SURVEY,
} from './importSurveyResponses.fixtures';

const DATA_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const testFunctionality = async () => {
  const assertResponseAnswersAreCorrect = async (surveyResponseId, expectedData) => {
    const { answers, ...surveyResponseData } = expectedData;

    const surveyResponse = await models.surveyResponse.findById(surveyResponseId);
    const foundAnswers = await surveyResponse.getAnswers();
    const foundAnswerObject = Object.fromEntries(foundAnswers.map(a => [a.question_id, a.text]));
    const fieldDescription = JSON.stringify(surveyResponseData, undefined, 2);
    const answerError = `Survey response with fields ${fieldDescription} has wrong answers`;

    expect(foundAnswerObject).to.deep.equal(answers, answerError);
  };

  const buildUniqueResponseNotFoundError = async (responseData, responseFields, foundLength) => {
    const { surveyCode } = responseData;
    const fieldDescription = JSON.stringify(responseData, undefined, 2);
    const survey = await models.survey.findOne({ code: surveyCode });
    const responsesForSurvey = await models.surveyResponse.find({ survey_id: survey.id });

    const errorParts = [
      `Expected exactly one survey_response record with data ${fieldDescription}`,
    ];
    if (foundLength === 0) {
      errorParts.push(
        `but ${foundLength} were found. Other responses for survey '${surveyCode}':`,
        ...responsesForSurvey.map(r => JSON.stringify(pick(r, Object.keys(responseFields)))),
      );
    } else {
      errorParts.push(`but ${foundLength} were found.`);
    }
    errorParts.push('');

    return errorParts.join('\n');
  };

  /**
   * Asserts that a survey response with the specified fields exists in the db
   * Returns the response, if found
   */
  const assertResponseRecordExists = async expectedData => {
    const { id, answers, ...surveyResponseData } = expectedData;
    const { surveyCode, entityCode, date } = surveyResponseData;

    const survey = await models.survey.findOne({ code: surveyCode });
    const entity = await models.entity.findOne({ code: entityCode });
    const expectedFields = {
      id,
      survey_id: survey.id,
      entity_id: entity.id,
      data_time: moment.utc(date).format(DATA_TIME_FORMAT),
    };

    let surveyResponse;
    if (id) {
      surveyResponse = await models.surveyResponse.findById(id);
      expect(surveyResponse, `Expect to find a survey response with id '${id}'`).to.exist;
      const foundFields = pick(surveyResponse, Object.keys(expectedFields));
      expect(foundFields).to.deep.equal(expectedFields);
    } else {
      const surveyResponses = await models.surveyResponse.find(expectedFields);
      const errorMessage =
        surveyResponses.length !== 1
          ? await buildUniqueResponseNotFoundError(
              surveyResponseData,
              expectedFields,
              surveyResponses.length,
            )
          : '';
      expect(surveyResponses).to.have.length(1, errorMessage);

      [surveyResponse] = surveyResponses;
    }

    return surveyResponse;
  };

  const app = new TestableApp();
  const { models } = app;

  before(async () => {
    await app.grantFullAccess();

    await findOrCreateDummyRecord(models.user, {
      email: 'test_email1@email.com',
      first_name: 'Test',
      last_name: 'User1',
      id: 'test_user_id_1',
    });

    await findOrCreateDummyRecord(models.user, {
      email: 'test_email2@email.com',
      first_name: 'Test',
      last_name: 'User2',
      id: 'test_user_id_2',
    });

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
  });

  after(async () => {
    await resetTestData(models.database);
    app.revokeAccess();
  });

  describe('non periodic surveys', () => {
    const surveys = [CLINIC_DATA_SURVEY, FACILITY_FUNDAMENTALS_SURVEY];

    before(async () => {
      await buildAndInsertSurveys(models, surveys);
      await createSurveyResponses(
        models,
        groupBy(
          [
            ...NON_PERIODIC_RESPONSES_AFTER_UPDATES.notAffected,
            ...NON_PERIODIC_RESPONSES_AFTER_UPDATES.updated,
          ],
          'surveyCode',
        ),
      );
      await importValidFile(app, 'functionality/nonPeriodicBaseline.xlsx');
      await importValidFile(app, 'functionality/nonPeriodicUpdates.xlsx', [
        'Test_Clinic_Data',
        'Test_Facility_Fundamentals',
      ]);
    });

    it('does not change responses that are not targeted by updates', async () => {
      for (const responseData of NON_PERIODIC_RESPONSES_AFTER_UPDATES.notAffected) {
        const { id } = await assertResponseRecordExists(responseData);
        await assertResponseAnswersAreCorrect(id, responseData);
      }
    });

    it('deletes the specified responses', async () => {
      for (const responseData of NON_PERIODIC_RESPONSES_AFTER_UPDATES.deleted) {
        const deletedResponse = await models.surveyResponse.findById(responseData.id);
        expect(deletedResponse).to.not.exist;
      }
    });

    it('updates the specified responses', async () => {
      for (const responseData of NON_PERIODIC_RESPONSES_AFTER_UPDATES.updated) {
        const { id } = await assertResponseRecordExists(responseData);
        await assertResponseAnswersAreCorrect(id, responseData);
      }
    });

    it('creates the specified responses', async () => {
      const { created, ...nonCreatedResponses } = NON_PERIODIC_RESPONSES_AFTER_UPDATES;
      const existingIds = Object.values(nonCreatedResponses)
        .flat()
        .map(r => r.id);

      for (const responseData of NON_PERIODIC_RESPONSES_AFTER_UPDATES.created) {
        const { id } = await assertResponseRecordExists(responseData);
        await assertResponseAnswersAreCorrect(id, responseData);

        existingIds.forEach(existingId => {
          expect(existingId).to.not.equal(
            id,
            `Expected a survey response to be created, but instead an existing id was used: ${existingId}`,
          );
        });
      }
    });

    it('no other responses are created', async () => {
      const foundResponses = await models.surveyResponse.find({
        survey_id: surveys.map(s => s.id),
      });
      const { deleted, ...nonDeletedResponses } = NON_PERIODIC_RESPONSES_AFTER_UPDATES;
      const expectedResponses = Object.values(nonDeletedResponses).flat();
      expect(foundResponses).to.have.length(expectedResponses.length);
    });
  });

  describe('periodic surveys', () => {
    const surveys = [YEARLY_SURVEY, WEEKLY_SURVEY];

    before(async () => {
      await buildAndInsertSurveys(models, surveys);
      await createSurveyResponses(
        models,
        groupBy(
          [
            ...PERIODIC_RESPONSES_AFTER_UPDATES.notAffected,
            ...PERIODIC_RESPONSES_AFTER_UPDATES.updated,
          ],
          'surveyCode',
        ),
      );
      await importValidFile(app, 'functionality/periodicBaseline.xlsx');
      await importValidFile(app, 'functionality/periodicUpdates.xlsx', [
        'Test_Yearly',
        'Test_Weekly',
      ]);
    });

    it('does not change responses that are not targeted by updates', async () => {
      for (const responseData of PERIODIC_RESPONSES_AFTER_UPDATES.notAffected) {
        const { id } = await assertResponseRecordExists(responseData);
        await assertResponseAnswersAreCorrect(id, responseData);
      }
    });

    it('deletes the specified responses', async () => {
      for (const responseData of PERIODIC_RESPONSES_AFTER_UPDATES.deleted) {
        const deletedResponse = await models.surveyResponse.findById(responseData.id);
        expect(deletedResponse).to.not.exist;
      }
    });

    it('updates the specified responses', async () => {
      for (const responseData of PERIODIC_RESPONSES_AFTER_UPDATES.updated) {
        const { id } = await assertResponseRecordExists(responseData);
        await assertResponseAnswersAreCorrect(id, responseData);
      }
    });

    it('creates the specified responses', async () => {
      const { created, ...nonCreatedResponses } = PERIODIC_RESPONSES_AFTER_UPDATES;
      const existingIds = Object.values(nonCreatedResponses)
        .flat()
        .map(r => r.id);

      for (const responseData of PERIODIC_RESPONSES_AFTER_UPDATES.created) {
        const { id } = await assertResponseRecordExists(responseData);
        await assertResponseAnswersAreCorrect(id, responseData);

        existingIds.forEach(existingId => {
          expect(existingId).to.not.equal(
            id,
            `Expected a survey response to be created, but instead an existing id was used: ${existingId}`,
          );
        });
      }
    });

    it('no other responses are created', async () => {
      const foundResponses = await models.surveyResponse.find({
        survey_id: surveys.map(s => s.id),
      });
      const { deleted, ...nonDeletedResponses } = PERIODIC_RESPONSES_AFTER_UPDATES;
      const expectedResponses = Object.values(nonDeletedResponses).flat();
      expect(foundResponses).to.have.length(expectedResponses.length);
    });
  });
};
