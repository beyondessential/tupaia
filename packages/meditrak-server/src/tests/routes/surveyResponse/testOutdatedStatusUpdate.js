/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { buildAndInsertSurveys, generateTestId } from '@tupaia/database';
import { SurveyResponseChangeHandler } from '../../../database/SurveyResponseChangeHandler/SurveyResponseChangeHandler';

const REFRESH_DEBOUNCE_TIME = 50; // short debounce time so tests run more quickly

const buildSurvey = (id, periodGranularity) => {
  const code = `Test_${periodGranularity || 'no_granularity'}`;

  return {
    id,
    code,
    period_granularity: periodGranularity,
    questions: [{ code: `${code}1`, type: 'Number' }],
  };
};

const yearlySurveyId = generateTestId();
const quarterlySurveyId = generateTestId();
const monthlySurveyId = generateTestId();
const weeklySurveyId = generateTestId();
const dailySurveyId = generateTestId();
const nonPeriodicSurveyId = generateTestId();

const SURVEYS = {
  [yearlySurveyId]: buildSurvey(yearlySurveyId, 'yearly'),
  [quarterlySurveyId]: buildSurvey(quarterlySurveyId, 'quarterly'),
  [monthlySurveyId]: buildSurvey(monthlySurveyId, 'monthly'),
  [weeklySurveyId]: buildSurvey(weeklySurveyId, 'weekly'),
  [dailySurveyId]: buildSurvey(dailySurveyId, 'daily'),
  [nonPeriodicSurveyId]: buildSurvey(nonPeriodicSurveyId),
};

export const testOutdatedStatusUpdate = app => {
  const { models } = app;
  const surveyResponseChangeHandler = new SurveyResponseChangeHandler(
    models,
    REFRESH_DEBOUNCE_TIME,
  );

  const datetime = date => `${date}T12:00:00`;

  const submitResponses = async responses => {
    const apiResponse = await app.post('surveyResponse', {
      body: responses.map(data => {
        const questionCode = SURVEYS[data.survey_id].questions[0].code;
        return { answers: { [questionCode]: 1 }, ...data };
      }),
    });

    expect(apiResponse.statusCode).to.equal(200);
    return apiResponse.body.results.map(result => result.surveyResponseId);
  };

  const updateResponse = async (responseId, data) => {
    const apiResponse = await app.put(`surveyResponses/${responseId}`, { body: data });
    expect(apiResponse.statusCode).to.equal(200);
  };

  const deleteResponse = async responseId => {
    const apiResponse = await app.delete(`surveyResponses/${responseId}`);
    expect(apiResponse.statusCode).to.equal(200);
  };

  const assertOutdatedStatuses = async expectedByResponseId => {
    await models.database.waitForAllChangeHandlers();
    const responses = await models.surveyResponse.find({
      id: Object.keys(expectedByResponseId),
    });

    for (const [responseId, expected] of Object.entries(expectedByResponseId)) {
      const response = responses.find(r => r.id === responseId);
      const survey = await models.survey.findById(response.survey_id);
      const entity = await models.entity.findById(response.entity_id);
      const responseDescriptionFields = {
        survey_code: survey.code,
        entity_code: entity.code,
        data_time: response.data_time,
      };
      const message = `Failed assertion for survey response ${JSON.stringify(
        responseDescriptionFields,
      )}`;

      expect(response).to.have.property('outdated', expected, message);
    }
  };

  before(async () => {
    await buildAndInsertSurveys(models, Object.values(SURVEYS));
  });

  beforeEach(async () => {
    surveyResponseChangeHandler.listenForChanges();
  });

  afterEach(async () => {
    surveyResponseChangeHandler.stopListeningForChanges();
    const surveyIds = Object.values(SURVEYS).map(s => s.id);
    await models.surveyResponse.delete({ survey_id: surveyIds });
  });

  describe('create', () => {
    it('created response is "not outdated" by default', async () => {
      const [responseId] = await submitResponses([
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-29') },
      ]);

      await assertOutdatedStatuses({ [responseId]: false });
    });

    describe('created response outdates existing response in the same dimension combo', () => {
      it('has later end time (date)', async () => {
        const [responseIdA, responseIdB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-29') },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-30') },
        ]);

        await assertOutdatedStatuses({
          [responseIdA]: true,
          [responseIdB]: false,
        });
      });

      it('has later end time (time)', async () => {
        const [responseIdA, responseIdB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: '2021-06-01T00:00:00' },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: '2021-06-01T00:00:01' },
        ]);

        await assertOutdatedStatuses({
          [responseIdA]: true,
          [responseIdB]: false,
        });
      });

      it('has same end time - most recent id is used', async () => {
        const [responseIdA, responseIdB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-30') },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-30') },
        ]);

        await assertOutdatedStatuses({
          [responseIdA]: true,
          [responseIdB]: false,
        });
      });
    });

    describe('created response is outdated by existing response in the same dimension combo', () => {
      it('has earlier end time (date)', async () => {
        const [responseIdA, responseIdB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-30') },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-29') },
        ]);

        await assertOutdatedStatuses({
          [responseIdA]: false,
          [responseIdB]: true,
        });
      });

      it('has earlier end time (time)', async () => {
        const [responseIdA, responseIdB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: '2021-06-30T23:59:59' },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: '2021-06-30T23:59:58' },
        ]);

        await assertOutdatedStatuses({
          [responseIdA]: false,
          [responseIdB]: true,
        });
      });
    });

    describe('created response with later end time does not outdate existing response in different dimension combo', () => {
      it('has different survey', async () => {
        const [responseIdA, responseIdB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-01') },
          { survey_id: yearlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-02') },
        ]);

        await assertOutdatedStatuses({
          [responseIdA]: false,
          [responseIdB]: false,
        });
      });

      it('has different entity', async () => {
        const [responseIdA, responseIdB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-01') },
          { survey_id: monthlySurveyId, entity_code: 'VU', timestamp: datetime('2021-06-02') },
        ]);

        await assertOutdatedStatuses({
          [responseIdA]: false,
          [responseIdB]: false,
        });
      });

      it('has different period', async () => {
        const [responseIdA, responseIdB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-30') },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-07-31') },
        ]);

        await assertOutdatedStatuses({
          [responseIdA]: false,
          [responseIdB]: false,
        });
      });
    });
  });

  describe('update', () => {
    it('updated response retains its "not outdated" status', async () => {
      const [responseId] = await submitResponses([
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-29') },
      ]);
      await assertOutdatedStatuses({ [responseId]: false });

      await updateResponse(responseId, { end_time: datetime('2021-06-28') });
      await assertOutdatedStatuses({ [responseId]: false });
    });

    describe('updated response outdates existing response in the same dimension combo', () => {
      it('gets later end time (date)', async () => {
        const [responseIdA, responseIdB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-01') },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-02') },
        ]);
        await assertOutdatedStatuses({
          [responseIdA]: true,
          [responseIdB]: false,
        });

        await updateResponse(responseIdA, { end_time: datetime('2021-06-03') });
        // Although end time of responseA is now most recent that responseB,
        // its data time is not updated so it will still be earlier
        // That shouldn't matter since all data times inside the same period are equal
        await assertOutdatedStatuses({
          [responseIdA]: false,
          [responseIdB]: true,
        });
      });

      it('gets later end time (time)', async () => {
        const [responseIdA, responseIdB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: '2021-06-01T00:00:00' },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: '2021-06-01T01:00:00' },
        ]);
        await assertOutdatedStatuses({
          [responseIdA]: true,
          [responseIdB]: false,
        });

        await updateResponse(responseIdA, { end_time: '2021-06-01T01:00:01' });
        await assertOutdatedStatuses({
          [responseIdA]: false,
          [responseIdB]: true,
        });
      });
    });

    it('updating a response to have the same end time with another response results in the one with the most recent id to be "not outdated"', async () => {
      const [responseIdA, responseIdB] = await submitResponses([
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-01') },
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-02') },
      ]);
      await assertOutdatedStatuses({
        [responseIdA]: true,
        [responseIdB]: false,
      });

      await updateResponse(responseIdA, { end_time: datetime('2021-06-02') });
      await assertOutdatedStatuses({
        [responseIdA]: true,
        [responseIdB]: false,
      });
    });

    describe('updating a "not outdated" response by moving it to a different dimension combo makes another response in its old combo "not outdated"', () => {
      it('gets new survey', async () => {
        const [responseIdA, responseIdB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-01') },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-02') },
        ]);
        await assertOutdatedStatuses({
          [responseIdA]: true,
          [responseIdB]: false,
        });

        await updateResponse(responseIdB, {
          survey_id: yearlySurveyId,
          end_time: datetime('2021-06-03'),
        });
        await assertOutdatedStatuses({
          [responseIdA]: false,
          [responseIdB]: false,
        });
      });

      it('gets new entity', async () => {
        const [responseIdA, responseIdB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-01') },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-02') },
        ]);
        await assertOutdatedStatuses({
          [responseIdA]: true,
          [responseIdB]: false,
        });

        const vanuatu = await models.entity.findOne({ code: 'VU' });
        await updateResponse(responseIdB, {
          entity_id: vanuatu.id,
          end_time: datetime('2021-06-03'),
        });
        await assertOutdatedStatuses({
          [responseIdA]: false,
          [responseIdB]: false,
        });
      });

      it('gets new period', async () => {
        const [responseIdA, responseIdB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-01') },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-02') },
        ]);
        await assertOutdatedStatuses({
          [responseIdA]: true,
          [responseIdB]: false,
        });

        await updateResponse(responseIdB, { data_time: datetime('2021-07-31') });
        await assertOutdatedStatuses({
          [responseIdA]: false,
          [responseIdB]: false,
        });
      });
    });

    it('moving an outdated response to a non periodic survey makes it "not outdated"', async () => {
      const [responseIdA, , responseIdC] = await submitResponses([
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-01') },
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-02') },
        { survey_id: nonPeriodicSurveyId, entity_code: 'TO', timestamp: datetime('2021-06-02') },
      ]);
      await assertOutdatedStatuses({
        [responseIdA]: true,
        [responseIdC]: false,
      });

      await updateResponse(responseIdA, { survey_id: nonPeriodicSurveyId });
      await assertOutdatedStatuses({
        [responseIdA]: false,
        [responseIdC]: false,
      });
    });

    it('updating an unrelated field does not result in outdated status updates', async () => {
      const [responseIdA, responseIdB] = await submitResponses([
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-01') },
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-02') },
      ]);
      await assertOutdatedStatuses({
        [responseIdA]: true,
        [responseIdB]: false,
      });

      await updateResponse(responseIdA, { assessor_name: 'Test New' });
      await assertOutdatedStatuses({
        [responseIdA]: true,
        [responseIdB]: false,
      });
    });
  });

  describe('delete', () => {
    it('deleting an "outdated" response does not result in outdated status updates', async () => {
      const [responseIdA, responseIdB] = await submitResponses([
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-29') },
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-30') },
      ]);
      await assertOutdatedStatuses({ [responseIdB]: false });

      await deleteResponse(responseIdA);
      await assertOutdatedStatuses({ [responseIdB]: false });
    });

    it('deleting a "not outdated" response makes a response in the same dimension combo "not outdated"', async () => {
      const [responseIdA, responseIdB] = await submitResponses([
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-29') },
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-30') },
      ]);
      await assertOutdatedStatuses({ [responseIdA]: true });

      await deleteResponse(responseIdB);
      await assertOutdatedStatuses({ [responseIdA]: false });
    });
  });

  describe('different period granularities', () => {
    it('yearly', async () => {
      const [p2020, p2021a, p2021b] = await submitResponses([
        { survey_id: yearlySurveyId, entity_code: 'TO', timestamp: datetime('2020-01-01') },
        { survey_id: yearlySurveyId, entity_code: 'TO', timestamp: datetime('2021-01-01') },
        { survey_id: yearlySurveyId, entity_code: 'TO', timestamp: datetime('2021-01-02') },
      ]);

      await assertOutdatedStatuses({
        [p2020]: false,
        [p2021a]: true,
        [p2021b]: false,
      });
    });

    it('quarterly', async () => {
      const [p2020Q1, p2020Q2a, p2020Q2b] = await submitResponses([
        { survey_id: quarterlySurveyId, entity_code: 'TO', timestamp: datetime('2020-01-01') },
        { survey_id: quarterlySurveyId, entity_code: 'TO', timestamp: datetime('2020-04-01') },
        { survey_id: quarterlySurveyId, entity_code: 'TO', timestamp: datetime('2020-04-02') },
      ]);

      await assertOutdatedStatuses({
        [p2020Q1]: false,
        [p2020Q2a]: true,
        [p2020Q2b]: false,
      });
    });

    it('monthly', async () => {
      const [p202001, p202002a, p202002b] = await submitResponses([
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2020-01-01') },
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2020-02-01') },
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2020-02-02') },
      ]);

      await assertOutdatedStatuses({
        [p202001]: false,
        [p202002a]: true,
        [p202002b]: false,
      });
    });

    it('weekly', async () => {
      const [p2020W1, p2020W2a, p2020W2b] = await submitResponses([
        { survey_id: weeklySurveyId, entity_code: 'TO', timestamp: datetime('2019-12-30') },
        { survey_id: weeklySurveyId, entity_code: 'TO', timestamp: datetime('2020-01-06') },
        { survey_id: weeklySurveyId, entity_code: 'TO', timestamp: datetime('2020-01-07') },
      ]);

      await assertOutdatedStatuses({
        [p2020W1]: false,
        [p2020W2a]: true,
        [p2020W2b]: false,
      });
    });

    it('daily', async () => {
      const [p20200101, p20200102a, p20200102b] = await submitResponses([
        { survey_id: dailySurveyId, entity_code: 'TO', timestamp: datetime('2020-01-01') },
        { survey_id: dailySurveyId, entity_code: 'TO', timestamp: datetime('2020-01-02') },
        { survey_id: dailySurveyId, entity_code: 'TO', timestamp: datetime('2020-01-02') },
      ]);

      await assertOutdatedStatuses({
        [p20200101]: false,
        [p20200102a]: true,
        [p20200102b]: false,
      });
    });

    it('no granularity', async () => {
      const [p20200101a, p20200101b, p20200101c] = await submitResponses([
        { survey_id: nonPeriodicSurveyId, entity_code: 'TO', timestamp: datetime('2020-01-01') },
        { survey_id: nonPeriodicSurveyId, entity_code: 'TO', timestamp: datetime('2021-01-01') },
        { survey_id: nonPeriodicSurveyId, entity_code: 'TO', timestamp: datetime('2021-01-01') },
      ]);

      // No response is outdated for non periodic surveys
      await assertOutdatedStatuses({
        [p20200101a]: false,
        [p20200101b]: false,
        [p20200101c]: false,
      });
    });
  });
};
