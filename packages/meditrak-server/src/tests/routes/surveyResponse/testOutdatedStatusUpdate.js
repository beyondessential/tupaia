/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable camelcase */

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
      const [id] = await submitResponses([
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-29') },
      ]);

      await assertOutdatedStatuses({ [id]: false });
    });

    describe('created response outdates existing response in the same dimension combo', () => {
      it('has later end time (date)', async () => {
        const [idA, idB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-29') },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-30') },
        ]);

        await assertOutdatedStatuses({
          [idA]: true,
          [idB]: false,
        });
      });

      it('has later end time (time)', async () => {
        const [idA, idB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: '2021-06-01T00:00:00' },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: '2021-06-01T00:00:01' },
        ]);

        await assertOutdatedStatuses({
          [idA]: true,
          [idB]: false,
        });
      });

      it('has same end time - most recent id is used', async () => {
        const [idA, idB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-30') },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-30') },
        ]);

        await assertOutdatedStatuses({
          [idA]: true,
          [idB]: false,
        });
      });
    });

    describe('created response is outdated by existing response in the same dimension combo', () => {
      it('has earlier end time (date)', async () => {
        const [idA, idB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-30') },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-29') },
        ]);

        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: true,
        });
      });

      it('has earlier end time (time)', async () => {
        const [idA, idB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: '2021-06-30T23:59:59' },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: '2021-06-30T23:59:58' },
        ]);

        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: true,
        });
      });
    });

    describe('created response with later end time does not outdate existing response in different dimension combo', () => {
      it('has different survey', async () => {
        const [idA, idB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-01') },
          { survey_id: yearlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-02') },
        ]);

        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: false,
        });
      });

      it('has different entity', async () => {
        const [idA, idB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-01') },
          { survey_id: monthlySurveyId, entity_code: 'VU', timestamp: datetime('2021-06-02') },
        ]);

        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: false,
        });
      });

      it('has different period', async () => {
        const [idA, idB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-30') },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-07-31') },
        ]);

        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: false,
        });
      });
    });
  });

  describe('update', () => {
    it('updated response retains its "not outdated" status', async () => {
      const [id] = await submitResponses([
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-29') },
      ]);
      await assertOutdatedStatuses({ [id]: false });

      await updateResponse(id, { end_time: datetime('2021-06-28') });
      await assertOutdatedStatuses({ [id]: false });
    });

    describe('updated response outdates existing response in the same dimension combo', () => {
      it('gets later end time (date)', async () => {
        const [idA, idB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-01') },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-02') },
        ]);
        await assertOutdatedStatuses({
          [idA]: true,
          [idB]: false,
        });

        await updateResponse(idA, { end_time: datetime('2021-06-03') });
        // Although end time of responseA is now most recent that responseB,
        // its data time is not updated so it will still be earlier
        // That shouldn't matter since all data times inside the same period are equal
        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: true,
        });
      });

      it('gets later end time (time)', async () => {
        const [idA, idB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: '2021-06-01T00:00:00' },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: '2021-06-01T01:00:00' },
        ]);
        await assertOutdatedStatuses({
          [idA]: true,
          [idB]: false,
        });

        await updateResponse(idA, { end_time: '2021-06-01T01:00:01' });
        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: true,
        });
      });
    });

    it('updating a response to have the same end time with another response results in the one with the most recent id to be "not outdated"', async () => {
      const [idA, idB] = await submitResponses([
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-01') },
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-02') },
      ]);
      await assertOutdatedStatuses({
        [idA]: true,
        [idB]: false,
      });

      await updateResponse(idA, { end_time: datetime('2021-06-02') });
      await assertOutdatedStatuses({
        [idA]: true,
        [idB]: false,
      });
    });

    describe('updating a "not outdated" response by moving it to a different dimension combo makes another response in its old combo "not outdated"', () => {
      it('gets new survey', async () => {
        const [idA, idB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-01') },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-02') },
        ]);
        await assertOutdatedStatuses({
          [idA]: true,
          [idB]: false,
        });

        await updateResponse(idB, {
          survey_id: yearlySurveyId,
          end_time: datetime('2021-06-03'),
        });
        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: false,
        });
      });

      it('gets new entity', async () => {
        const [idA, idB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-01') },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-02') },
        ]);
        await assertOutdatedStatuses({
          [idA]: true,
          [idB]: false,
        });

        const vanuatu = await models.entity.findOne({ code: 'VU' });
        await updateResponse(idB, {
          entity_id: vanuatu.id,
          end_time: datetime('2021-06-03'),
        });
        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: false,
        });
      });

      it('gets new period', async () => {
        const [idA, idB] = await submitResponses([
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-01') },
          { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-02') },
        ]);
        await assertOutdatedStatuses({
          [idA]: true,
          [idB]: false,
        });

        await updateResponse(idB, { data_time: datetime('2021-07-31') });
        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: false,
        });
      });
    });

    it('moving an outdated response to a non periodic survey makes it "not outdated"', async () => {
      const [idA, , idC] = await submitResponses([
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-01') },
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-02') },
        { survey_id: nonPeriodicSurveyId, entity_code: 'TO', timestamp: datetime('2021-06-02') },
      ]);
      await assertOutdatedStatuses({
        [idA]: true,
        [idC]: false,
      });

      await updateResponse(idA, { survey_id: nonPeriodicSurveyId });
      await assertOutdatedStatuses({
        [idA]: false,
        [idC]: false,
      });
    });

    it('updating an unrelated field does not result in outdated status updates', async () => {
      const [idA, idB] = await submitResponses([
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-01') },
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-02') },
      ]);
      await assertOutdatedStatuses({
        [idA]: true,
        [idB]: false,
      });

      await updateResponse(idA, { assessor_name: 'Test New' });
      await assertOutdatedStatuses({
        [idA]: true,
        [idB]: false,
      });
    });
  });

  describe('delete', () => {
    it('deleting an "outdated" response does not result in outdated status updates', async () => {
      const [idA, idB] = await submitResponses([
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-29') },
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-30') },
      ]);
      await assertOutdatedStatuses({ [idB]: false });

      await deleteResponse(idA);
      await assertOutdatedStatuses({ [idB]: false });
    });

    it('deleting a "not outdated" response makes a response in the same dimension combo "not outdated"', async () => {
      const [idA, idB] = await submitResponses([
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-29') },
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2021-06-30') },
      ]);
      await assertOutdatedStatuses({ [idA]: true });

      await deleteResponse(idB);
      await assertOutdatedStatuses({ [idA]: false });
    });
  });

  describe('different period granularities', () => {
    it('yearly', async () => {
      const [id_2020, id_2021a, id_2021b] = await submitResponses([
        { survey_id: yearlySurveyId, entity_code: 'TO', timestamp: datetime('2020-01-01') },
        { survey_id: yearlySurveyId, entity_code: 'TO', timestamp: datetime('2021-01-01') },
        { survey_id: yearlySurveyId, entity_code: 'TO', timestamp: datetime('2021-01-02') },
      ]);

      await assertOutdatedStatuses({
        [id_2020]: false,
        [id_2021a]: true,
        [id_2021b]: false,
      });
    });

    it('quarterly', async () => {
      const [id_2020Q1, id_2020Q2a, id_2020Q2b] = await submitResponses([
        { survey_id: quarterlySurveyId, entity_code: 'TO', timestamp: datetime('2020-01-01') },
        { survey_id: quarterlySurveyId, entity_code: 'TO', timestamp: datetime('2020-04-01') },
        { survey_id: quarterlySurveyId, entity_code: 'TO', timestamp: datetime('2020-04-02') },
      ]);

      await assertOutdatedStatuses({
        [id_2020Q1]: false,
        [id_2020Q2a]: true,
        [id_2020Q2b]: false,
      });
    });

    it('monthly', async () => {
      const [id_202001, id_202002a, id_202002b] = await submitResponses([
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2020-01-01') },
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2020-02-01') },
        { survey_id: monthlySurveyId, entity_code: 'TO', timestamp: datetime('2020-02-02') },
      ]);

      await assertOutdatedStatuses({
        [id_202001]: false,
        [id_202002a]: true,
        [id_202002b]: false,
      });
    });

    it('weekly', async () => {
      const [id_2020W1, id_2020W2a, id_2020W2b] = await submitResponses([
        { survey_id: weeklySurveyId, entity_code: 'TO', timestamp: datetime('2019-12-30') },
        { survey_id: weeklySurveyId, entity_code: 'TO', timestamp: datetime('2020-01-06') },
        { survey_id: weeklySurveyId, entity_code: 'TO', timestamp: datetime('2020-01-07') },
      ]);

      await assertOutdatedStatuses({
        [id_2020W1]: false,
        [id_2020W2a]: true,
        [id_2020W2b]: false,
      });
    });

    it('daily', async () => {
      const [id_20200101, id_20200102a, id_20200102b] = await submitResponses([
        { survey_id: dailySurveyId, entity_code: 'TO', timestamp: datetime('2020-01-01') },
        { survey_id: dailySurveyId, entity_code: 'TO', timestamp: datetime('2020-01-02') },
        { survey_id: dailySurveyId, entity_code: 'TO', timestamp: datetime('2020-01-02') },
      ]);

      await assertOutdatedStatuses({
        [id_20200101]: false,
        [id_20200102a]: true,
        [id_20200102b]: false,
      });
    });

    it('no granularity', async () => {
      const [id_20200101a, id_20200101b, id_20200101c] = await submitResponses([
        { survey_id: nonPeriodicSurveyId, entity_code: 'TO', timestamp: datetime('2020-01-01') },
        { survey_id: nonPeriodicSurveyId, entity_code: 'TO', timestamp: datetime('2021-01-01') },
        { survey_id: nonPeriodicSurveyId, entity_code: 'TO', timestamp: datetime('2021-01-01') },
      ]);

      // No response is outdated for non periodic surveys
      await assertOutdatedStatuses({
        [id_20200101a]: false,
        [id_20200101b]: false,
        [id_20200101c]: false,
      });
    });
  });
};
