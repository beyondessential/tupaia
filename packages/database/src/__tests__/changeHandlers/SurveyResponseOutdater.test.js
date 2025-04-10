/* eslint-disable camelcase */

import { SurveyResponseOutdater } from '../../server/changeHandlers';
import {
  buildAndInsertSurveys,
  findOrCreateDummyRecord,
  getTestModels,
  populateTestData,
  upsertDummyRecord,
} from '../../server/testUtilities';
import { generateId } from '../../core/utilities';

const buildSurvey = (id, periodGranularity) => {
  const code = `Test_${periodGranularity || 'no_granularity'}`;

  return {
    id,
    code,
    period_granularity: periodGranularity,
    questions: [{ code: `${code}1`, type: 'Number' }],
  };
};

const yearlySurveyId = generateId();
const quarterlySurveyId = generateId();
const monthlySurveyId = generateId();
const weeklySurveyId = generateId();
const dailySurveyId = generateId();
const nonPeriodicSurveyId = generateId();

const userId = generateId();

const SURVEYS = {
  [yearlySurveyId]: buildSurvey(yearlySurveyId, 'yearly'),
  [quarterlySurveyId]: buildSurvey(quarterlySurveyId, 'quarterly'),
  [monthlySurveyId]: buildSurvey(monthlySurveyId, 'monthly'),
  [weeklySurveyId]: buildSurvey(weeklySurveyId, 'weekly'),
  [dailySurveyId]: buildSurvey(dailySurveyId, 'daily'),
  [nonPeriodicSurveyId]: buildSurvey(nonPeriodicSurveyId),
};

describe('SurveyResponseOutdater', () => {
  const models = getTestModels();
  const responseOutdater = new SurveyResponseOutdater(models);
  responseOutdater.setDebounceTime(50); // short debounce time so tests run more quickly

  const createResponses = async data => {
    const { surveyResponses } = await populateTestData(models, {
      surveyResponse: data.map(({ date, ...otherFields }) => {
        // append time if required
        const datetime = date ?? `${date}T12:00:00`.slice(0, 'YYYY-MM-DDThh:mm:ss'.length);

        return {
          start_time: datetime,
          end_time: datetime,
          data_time: datetime,
          user_id: userId,
          ...otherFields,
        };
      }),
    });

    return surveyResponses.map(sr => sr.id);
  };

  const assertOutdatedStatuses = async expectedByResponseId => {
    await models.database.waitForAllChangeHandlers();
    const surveyResponses = await models.surveyResponse.find({
      id: Object.keys(expectedByResponseId),
    });

    for (const [surveyResponseId, expected] of Object.entries(expectedByResponseId)) {
      const surveyResponse = surveyResponses.find(r => r.id === surveyResponseId);
      // TODO use custom assertion message when jest-expect-message is re-enabled
      // const survey = await models.survey.findById(surveyResponse.survey_id);
      // const entity = await models.entity.findById(surveyResponse.entity_id);
      // const responseDescriptionFields = {
      //   survey_code: survey.code,
      //   entity_id: entity.code,
      //   data_time: surveyResponse.data_time,
      // };
      // const message = `Failed assertion for survey response ${JSON.stringify(
      //   responseDescriptionFields,
      // )}`;

      expect(surveyResponse).toHaveProperty('outdated', expected);
    }
  };

  let tonga;
  let vanuatu;

  beforeAll(async () => {
    tonga = await findOrCreateDummyRecord(models.entity, { code: 'TO' });
    vanuatu = await findOrCreateDummyRecord(models.entity, { code: 'VU' });
    await upsertDummyRecord(models.user, { id: userId });
    await buildAndInsertSurveys(models, Object.values(SURVEYS));
  });

  beforeEach(async () => {
    responseOutdater.listenForChanges();
  });

  afterEach(async () => {
    responseOutdater.stopListeningForChanges();
    const surveyIds = Object.values(SURVEYS).map(s => s.id);
    await models.surveyResponse.delete({ survey_id: surveyIds });
  });

  describe('create', () => {
    it('created response is "not outdated" by default', async () => {
      const [id] = await createResponses([
        { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-29' },
      ]);

      await assertOutdatedStatuses({ [id]: false });
    });

    describe('created response outdates existing response in the same dimension combo', () => {
      it('has later end time (date)', async () => {
        const [idA, idB] = await createResponses([
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-29' },
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-30' },
        ]);

        await assertOutdatedStatuses({
          [idA]: true,
          [idB]: false,
        });
      });

      it('has later end time (time)', async () => {
        const [idA, idB] = await createResponses([
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-01T00:00:00' },
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-01T00:00:01' },
        ]);

        await assertOutdatedStatuses({
          [idA]: true,
          [idB]: false,
        });
      });

      it('has same end time - most recent id is used', async () => {
        const [idA, idB] = await createResponses([
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-30' },
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-30' },
        ]);

        await assertOutdatedStatuses({
          [idA]: true,
          [idB]: false,
        });
      });
    });

    describe('created response is outdated by existing response in the same dimension combo', () => {
      it('has earlier end time (date)', async () => {
        const [idA, idB] = await createResponses([
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-30' },
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-29' },
        ]);

        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: true,
        });
      });

      it('has earlier end time (time)', async () => {
        const [idA, idB] = await createResponses([
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-30T23:59:59' },
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-30T23:59:58' },
        ]);

        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: true,
        });
      });
    });

    describe('created response with later end time does not outdate existing response in different dimension combo', () => {
      it('has different survey', async () => {
        const [idA, idB] = await createResponses([
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-01' },
          { survey_id: yearlySurveyId, entity_id: tonga.id, date: '2021-06-02' },
        ]);

        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: false,
        });
      });

      it('has different entity', async () => {
        const [idA, idB] = await createResponses([
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-01' },
          { survey_id: monthlySurveyId, entity_id: vanuatu.id, date: '2021-06-02' },
        ]);

        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: false,
        });
      });

      it('has different period', async () => {
        const [idA, idB] = await createResponses([
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-30' },
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-07-31' },
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
      const [id] = await createResponses([
        { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-29' },
      ]);
      await assertOutdatedStatuses({ [id]: false });

      await models.surveyResponse.update({ id }, { end_time: '2021-06-28' });
      await assertOutdatedStatuses({ [id]: false });
    });

    describe('updated response outdates existing response in the same dimension combo', () => {
      it('gets later end time (date)', async () => {
        const [idA, idB] = await createResponses([
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-01' },
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-02' },
        ]);
        await assertOutdatedStatuses({
          [idA]: true,
          [idB]: false,
        });

        await models.surveyResponse.update({ id: idA }, { end_time: '2021-06-03' });
        // Although end time of responseA is now most recent that responseB,
        // its data time is not updated so it will still be earlier
        // That shouldn't matter since all data times inside the same period are equal
        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: true,
        });
      });

      it('gets later end time (time)', async () => {
        const [idA, idB] = await createResponses([
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-01T00:00:00' },
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-01T01:00:00' },
        ]);
        await assertOutdatedStatuses({
          [idA]: true,
          [idB]: false,
        });

        await models.surveyResponse.update({ id: idA }, { end_time: '2021-06-01T01:00:01' });
        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: true,
        });
      });
    });

    it('updating a response to have the same end time with another response results in the one with the most recent id to be "not outdated"', async () => {
      const [idA, idB] = await createResponses([
        { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-01' },
        { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-02' },
      ]);
      await assertOutdatedStatuses({
        [idA]: true,
        [idB]: false,
      });

      await models.surveyResponse.update({ id: idA }, { end_time: '2021-06-02' });
      await assertOutdatedStatuses({
        [idA]: true,
        [idB]: false,
      });
    });

    describe('updating a "not outdated" response by moving it to a different dimension combo makes another response in its old combo "not outdated"', () => {
      it('gets new survey', async () => {
        const [idA, idB] = await createResponses([
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-01' },
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-02' },
        ]);
        await assertOutdatedStatuses({
          [idA]: true,
          [idB]: false,
        });

        await models.surveyResponse.update(
          { id: idB },
          {
            survey_id: yearlySurveyId,
            end_time: '2021-06-03',
          },
        );
        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: false,
        });
      });

      it('gets new entity', async () => {
        const [idA, idB] = await createResponses([
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-01' },
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-02' },
        ]);
        await assertOutdatedStatuses({
          [idA]: true,
          [idB]: false,
        });

        await models.surveyResponse.update(
          { id: idB },
          {
            entity_id: vanuatu.id,
            end_time: '2021-06-03',
          },
        );
        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: false,
        });
      });

      it('gets new period', async () => {
        const [idA, idB] = await createResponses([
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-01' },
          { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-02' },
        ]);
        await assertOutdatedStatuses({
          [idA]: true,
          [idB]: false,
        });

        await models.surveyResponse.update({ id: idB }, { data_time: '2021-07-31' });
        await assertOutdatedStatuses({
          [idA]: false,
          [idB]: false,
        });
      });
    });

    it("Changing a response to be outdated doesn't change the status", async () => {
      const [idA] = await createResponses([
        { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-01' },
      ]);
      await assertOutdatedStatuses({
        [idA]: false,
      });

      await models.surveyResponse.update({ id: idA }, { outdated: true });
      await assertOutdatedStatuses({
        [idA]: true,
      });
    });

    it('moving an outdated response to a non periodic survey makes it "not outdated"', async () => {
      const [idA, , idC] = await createResponses([
        { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-01' },
        { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-02' },
        { survey_id: nonPeriodicSurveyId, entity_id: tonga.id, date: '2021-06-02' },
      ]);
      await assertOutdatedStatuses({
        [idA]: true,
        [idC]: false,
      });

      await models.surveyResponse.update({ id: idA }, { survey_id: nonPeriodicSurveyId });
      await assertOutdatedStatuses({
        [idA]: false,
        [idC]: false,
      });
    });

    it('updating an unrelated field does not result in outdated status updates', async () => {
      const [idA, idB] = await createResponses([
        { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-01' },
        { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-02' },
      ]);
      await assertOutdatedStatuses({
        [idA]: true,
        [idB]: false,
      });

      await models.surveyResponse.update({ id: idA }, { assessor_name: 'Test New' });
      await assertOutdatedStatuses({
        [idA]: true,
        [idB]: false,
      });
    });
  });

  describe('delete', () => {
    it('deleting an "outdated" response does not result in outdated status updates', async () => {
      const [idA, idB] = await createResponses([
        { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-29' },
        { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-30' },
      ]);
      await assertOutdatedStatuses({ [idB]: false });

      await models.surveyResponse.delete({ id: idA });
      await assertOutdatedStatuses({ [idB]: false });
    });

    it('deleting a "not outdated" response makes a response in the same dimension combo "not outdated"', async () => {
      const [idA, idB] = await createResponses([
        { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-29' },
        { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2021-06-30' },
      ]);
      await assertOutdatedStatuses({ [idA]: true });

      await models.surveyResponse.delete({ id: idB });
      await assertOutdatedStatuses({ [idA]: false });
    });
  });

  describe('different period granularities', () => {
    it('yearly', async () => {
      const [id_2020, id_2021a, id_2021b] = await createResponses([
        { survey_id: yearlySurveyId, entity_id: tonga.id, date: '2020-01-01' },
        { survey_id: yearlySurveyId, entity_id: tonga.id, date: '2021-01-01' },
        { survey_id: yearlySurveyId, entity_id: tonga.id, date: '2021-01-02' },
      ]);

      await assertOutdatedStatuses({
        [id_2020]: false,
        [id_2021a]: true,
        [id_2021b]: false,
      });
    });

    it('quarterly', async () => {
      const [id_2020Q1, id_2020Q2a, id_2020Q2b] = await createResponses([
        { survey_id: quarterlySurveyId, entity_id: tonga.id, date: '2020-01-01' },
        { survey_id: quarterlySurveyId, entity_id: tonga.id, date: '2020-04-01' },
        { survey_id: quarterlySurveyId, entity_id: tonga.id, date: '2020-04-02' },
      ]);

      await assertOutdatedStatuses({
        [id_2020Q1]: false,
        [id_2020Q2a]: true,
        [id_2020Q2b]: false,
      });
    });

    it('monthly', async () => {
      const [id_202001, id_202002a, id_202002b] = await createResponses([
        { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2020-01-01' },
        { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2020-02-01' },
        { survey_id: monthlySurveyId, entity_id: tonga.id, date: '2020-02-02' },
      ]);

      await assertOutdatedStatuses({
        [id_202001]: false,
        [id_202002a]: true,
        [id_202002b]: false,
      });
    });

    it('weekly', async () => {
      const [id_2020W1, id_2020W2a, id_2020W2b] = await createResponses([
        { survey_id: weeklySurveyId, entity_id: tonga.id, date: '2019-12-30' },
        { survey_id: weeklySurveyId, entity_id: tonga.id, date: '2020-01-06' },
        { survey_id: weeklySurveyId, entity_id: tonga.id, date: '2020-01-07' },
      ]);

      await assertOutdatedStatuses({
        [id_2020W1]: false,
        [id_2020W2a]: true,
        [id_2020W2b]: false,
      });
    });

    it('daily', async () => {
      const [id_20200101, id_20200102a, id_20200102b] = await createResponses([
        { survey_id: dailySurveyId, entity_id: tonga.id, date: '2020-01-01' },
        { survey_id: dailySurveyId, entity_id: tonga.id, date: '2020-01-02' },
        { survey_id: dailySurveyId, entity_id: tonga.id, date: '2020-01-02' },
      ]);

      await assertOutdatedStatuses({
        [id_20200101]: false,
        [id_20200102a]: true,
        [id_20200102b]: false,
      });
    });

    it('no granularity', async () => {
      const [id_20200101a, id_20200101b, id_20200101c] = await createResponses([
        { survey_id: nonPeriodicSurveyId, entity_id: tonga.id, date: '2020-01-01' },
        { survey_id: nonPeriodicSurveyId, entity_id: tonga.id, date: '2021-01-01' },
        { survey_id: nonPeriodicSurveyId, entity_id: tonga.id, date: '2021-01-01' },
      ]);

      // No response is outdated for non periodic surveys
      await assertOutdatedStatuses({
        [id_20200101a]: false,
        [id_20200101b]: false,
        [id_20200101c]: false,
      });
    });
  });
});
