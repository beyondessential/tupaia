import {
  getTestModels,
  populateTestData,
  clearTestData,
  upsertDummyRecord,
} from '../../server/testUtilities';
import { AnalyticsRefresher } from '../../server/changeHandlers/AnalyticsRefresher';

import { TEST_DATA, ANALYTICS, ANSWER001_TEST_ANALYTIC } from './AnalyticsRefresher.fixtures';

const matchingFields = [
  'value',
  'type',
  'entity_code',
  'entity_name',
  'data_element_code',
  'data_group_code',
  'event_id',
  'year_period',
  'month_period',
  'week_period',
  'day_period',
  'date',
];

const REFRESH_DEBOUNCE_TIME = 100; // short debounce time so tests run more quickly

describe('AnalyticsRefresher', () => {
  const models = getTestModels();
  const analyticsRefresher = new AnalyticsRefresher(models);
  analyticsRefresher.setDebounceTime(REFRESH_DEBOUNCE_TIME);

  const assertAnalyticsMatch = async (
    expectedAnalytics,
    codesToFetch = TEST_DATA.question.map(q => q.code),
  ) => {
    await models.database.waitForAllChangeHandlers();
    const analyticsInDb = await models.analytics.find({
      data_element_code: codesToFetch,
    });
    const formattedAnalyticsInDb = analyticsInDb.map(analytic => {
      const formattedAnalytic = {};
      matchingFields.forEach(field => {
        formattedAnalytic[field] = analytic[field];
      });
      return formattedAnalytic;
    });

    let matchedAnalytics = [];
    let remainingAnalytics = formattedAnalyticsInDb;
    expectedAnalytics.forEach(expectedAnalytic => {
      const matchingAnalytics = remainingAnalytics.filter(analytic =>
        matchingFields.every(field => analytic[field] === expectedAnalytic[field]),
      );
      expect(matchingAnalytics.length).toBe(
        1,
        `No matching analytic found.\nExpected:\n${JSON.stringify(
          expectedAnalytic,
        )}\nRemaining:\n${remainingAnalytics.map(JSON.stringify)}`,
      ); // Just one single matching analytic, no more or less
      remainingAnalytics = remainingAnalytics.filter(
        analytic => !matchingAnalytics.includes(analytic),
      );
      matchedAnalytics = matchedAnalytics.concat(matchingAnalytics);
    });
    expect(remainingAnalytics.length).toBe(
      0,
      `Unexpected analytics remaining: ${remainingAnalytics.map(JSON.stringify)}`,
    ); // All analytics were matched
  };

  beforeEach(async () => {
    await populateTestData(models, TEST_DATA);
    await AnalyticsRefresher.refreshAnalytics(models.database);
    analyticsRefresher.listenForChanges();
  });

  afterEach(async () => {
    analyticsRefresher.stopListeningForChanges();
    await clearTestData(models.database);
  });

  it('refreshes analytics table if answers are added', async () => {
    // Add an answer, make sure analytic is populated
    await upsertDummyRecord(models.surveyResponse, {
      id: 'create_test_survey_response',
      data_time: '2020-01-01 11:58:23',
      survey_id: 'survey001_test',
      entity_id: 'entity001_test',
      user_id: 'user001_test',
    });
    await upsertDummyRecord(models.answer, {
      id: 'create_test_answer001',
      type: 'Number',
      text: '7',
      survey_response_id: 'create_test_survey_response',
      question_id: 'question001_test',
    });
    await upsertDummyRecord(models.answer, {
      id: 'create_test_answer002',
      type: 'Number',
      text: '5',
      survey_response_id: 'create_test_survey_response',
      question_id: 'question002_test',
    });
    await assertAnalyticsMatch(
      ANALYTICS.concat([
        {
          value: '7',
          type: 'Number',
          entity_code: 'E001',
          entity_name: 'Happy Land',
          data_element_code: 'Q001',
          data_group_code: 'S001',
          event_id: 'create_test_survey_response',
          year_period: '2020',
          month_period: '202001',
          week_period: '2020W01',
          day_period: '20200101',
          date: '2020-01-01 11:58:23',
        },
        {
          value: '5',
          type: 'Number',
          entity_code: 'E001',
          entity_name: 'Happy Land',
          data_element_code: 'Q002',
          data_group_code: 'S001',
          event_id: 'create_test_survey_response',
          year_period: '2020',
          month_period: '202001',
          week_period: '2020W01',
          day_period: '20200101',
          date: '2020-01-01 11:58:23',
        },
      ]),
    );
  });

  it('refreshes analytics table if answers are deleted', async () => {
    // Delete an answer, make sure analytic is removed
    const answerToDelete = 'answer001_test';
    await models.answer.delete({ id: answerToDelete });
    await assertAnalyticsMatch(ANALYTICS.filter(analytic => analytic !== ANSWER001_TEST_ANALYTIC));
  });

  it('refreshes analytics table if answers are updated', async () => {
    // Update an answer, make sure analytic is updated
    await models.answer.update(
      {
        id: 'answer001_test',
      },
      { text: '14' },
    );
    const updatedAnalytics = ANALYTICS.map(analytic => {
      if (analytic === ANSWER001_TEST_ANALYTIC) {
        return {
          ...analytic,
          value: '14',
        };
      }
      return analytic;
    });
    await assertAnalyticsMatch(updatedAnalytics);
  });

  it('refreshes analytics table if survey responses are updated', async () => {
    // Update an answer, make sure analytic is updated
    await models.surveyResponse.update(
      {
        id: 'surveyResponse001_test',
      },
      { data_time: '2020-02-02 11:58:23' },
    );
    const updatedAnalytics = ANALYTICS.map(analytic => {
      if (analytic.event_id === 'surveyResponse001_test') {
        return {
          ...analytic,
          year_period: '2020',
          month_period: '202002',
          week_period: '2020W05',
          day_period: '20200202',
          date: '2020-02-02 11:58:23',
        };
      }
      return analytic;
    });
    await assertAnalyticsMatch(updatedAnalytics);
  });

  it('refreshes analytics table if surveys are updated', async () => {
    // Update an answer, make sure analytic is updated
    await models.survey.update(
      {
        id: 'survey001_test',
      },
      { code: 'updated_code' },
    );
    const updatedAnalytics = ANALYTICS.map(analytic => {
      if (analytic.data_group_code === 'S001') {
        return {
          ...analytic,
          data_group_code: 'updated_code',
        };
      }
      return analytic;
    });
    await assertAnalyticsMatch(updatedAnalytics);
  });

  it('refreshes analytics table if entities are updated', async () => {
    // Update an answer, make sure analytic is updated
    await models.entity.update(
      {
        id: 'entity001_test',
      },
      { code: 'HAPPIER_LAND', name: 'The happiest land of all' },
    );
    const updatedAnalytics = ANALYTICS.map(analytic => {
      if (analytic.entity_code === 'E001') {
        return {
          ...analytic,
          entity_code: 'HAPPIER_LAND',
          entity_name: 'The happiest land of all',
        };
      }
      return analytic;
    });
    await assertAnalyticsMatch(updatedAnalytics);
  });

  it('refreshes analytics table if questions are updated', async () => {
    // Update an answer, make sure analytic is updated
    await models.question.update(
      {
        id: 'question001_test',
      },
      { code: 'NEW_Q' },
    );
    const updatedAnalytics = ANALYTICS.map(analytic => {
      if (analytic.data_element_code === 'Q001') {
        return {
          ...analytic,
          data_element_code: 'NEW_Q',
        };
      }
      return analytic;
    });
    await assertAnalyticsMatch(updatedAnalytics, [...TEST_DATA.question.map(q => q.code), 'NEW_Q']);
  });

  it('refreshes analytics table if data sources are updated', async () => {
    // Update an answer, make sure analytic is updated
    await models.dataElement.update(
      {
        id: 'dataElement001_test',
      },
      { service_type: 'dhis', config: { dhisInstanceCode: 'regional' } },
    );
    const updatedAnalytics = ANALYTICS.filter(analytic => analytic.data_element_code !== 'Q001');
    await assertAnalyticsMatch(updatedAnalytics);
  });
});
