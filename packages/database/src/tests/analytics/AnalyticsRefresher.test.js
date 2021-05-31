/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';
import { sleep } from '@tupaia/utils';
import {
  getTestDatabase,
  getTestModels,
  populateTestData,
  clearTestData,
  upsertDummyRecord,
} from '../../testUtilities';
import { AnalyticsRefresher } from '../../analytics/AnalyticsRefresher';

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
  const database = getTestDatabase();
  const models = getTestModels();
  const analyticsRefresher = new AnalyticsRefresher(database, models, REFRESH_DEBOUNCE_TIME);

  const assertAnalyticsMatch = async expectedAnalytics => {
    await models.database.waitForAllChangeHandlers();
    const analyticsInDb = await models.analytics.find({
      data_element_code: TEST_DATA.question.map(q => q.code),
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
      expect(matchingAnalytics.length).to.equal(
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
    expect(remainingAnalytics.length).to.equal(
      0,
      `Unexpected analytics remaining: ${remainingAnalytics.map(JSON.stringify)}`,
    ); // All analytics were matched
  };

  beforeEach(async () => {
    await populateTestData(models, TEST_DATA);
    await AnalyticsRefresher.executeRefresh(database);
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
          year_period: '2020-01-01 00:00:00',
          month_period: '2020-01-01 00:00:00',
          week_period: '2019-12-30 00:00:00',
          day_period: '2020-01-01 00:00:00',
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
          year_period: '2020-01-01 00:00:00',
          month_period: '2020-01-01 00:00:00',
          week_period: '2019-12-30 00:00:00',
          day_period: '2020-01-01 00:00:00',
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
          year_period: '2020-01-01 00:00:00',
          month_period: '2020-02-01 00:00:00',
          week_period: '2020-01-27 00:00:00',
          day_period: '2020-02-02 00:00:00',
          date: '2020-02-02 11:58:23',
        };
      }
      return analytic;
    });
    await assertAnalyticsMatch(updatedAnalytics);
  });

  it('debounces analytics table refreshes that are started at the same time', async () => {
    sinon.stub(AnalyticsRefresher, 'executeRefresh');

    // call several times in a row
    analyticsRefresher.scheduleAnalyticsRefresh();
    analyticsRefresher.scheduleAnalyticsRefresh();
    analyticsRefresher.scheduleAnalyticsRefresh();
    await analyticsRefresher.scheduleAnalyticsRefresh(); // await final call

    expect(AnalyticsRefresher.executeRefresh).to.have.been.calledOnce; // should have debounced

    AnalyticsRefresher.executeRefresh.restore();
  });

  it('debounces analytics table refreshes that are started within a second of another one each other', async () => {
    sinon.stub(AnalyticsRefresher, 'executeRefresh');

    // call several times with half the debounce time between each
    analyticsRefresher.scheduleAnalyticsRefresh();
    await sleep(REFRESH_DEBOUNCE_TIME / 2);
    analyticsRefresher.scheduleAnalyticsRefresh();
    await sleep(REFRESH_DEBOUNCE_TIME / 2);
    analyticsRefresher.scheduleAnalyticsRefresh();
    await sleep(REFRESH_DEBOUNCE_TIME / 2);
    await analyticsRefresher.scheduleAnalyticsRefresh(); // await final call

    expect(AnalyticsRefresher.executeRefresh).to.have.been.calledOnce; // should have debounced

    AnalyticsRefresher.executeRefresh.restore();
  });

  it('only runs one refresh at a time', async () => {
    let resolveOnRefreshStart;
    let isRefreshRunning = false;
    let refreshNumber = 0;
    sinon.stub(AnalyticsRefresher, 'executeRefresh').callsFake(async () => {
      if (resolveOnRefreshStart) {
        resolveOnRefreshStart();
      }
      expect(isRefreshRunning).to.equal(false); // assert against concurrent refreshes
      isRefreshRunning = true;
      refreshNumber++;
      // sleep for longer than the debounce time so that we're still refreshing when the next one
      // should be triggered
      await sleep(REFRESH_DEBOUNCE_TIME + 200);
      isRefreshRunning = false;
    });

    // start a refresh
    analyticsRefresher.scheduleAnalyticsRefresh();
    const refreshOneStarted = new Promise(resolve => {
      resolveOnRefreshStart = resolve;
    });

    // after refresh one has started but not yet completed, schedule another analytics refresh
    await refreshOneStarted;
    expect(isRefreshRunning).to.equal(true);
    expect(refreshNumber).to.equal(1);
    analyticsRefresher.scheduleAnalyticsRefresh();
    const refreshTwoStarted = new Promise(resolve => {
      resolveOnRefreshStart = resolve;
    });

    // wait for longer than the debounce time, so the just scheduled refresh would want to start,
    // but should still be running the first refresh
    await sleep(REFRESH_DEBOUNCE_TIME + 10);
    expect(isRefreshRunning).to.equal(true);
    expect(refreshNumber).to.equal(1);

    // after refresh two has started but not yet completed, schedule another few analytics refresh
    // these should debounce and result in one more refresh
    await refreshTwoStarted;
    expect(isRefreshRunning).to.equal(true);
    expect(refreshNumber).to.equal(2);
    analyticsRefresher.scheduleAnalyticsRefresh();
    analyticsRefresher.scheduleAnalyticsRefresh();
    analyticsRefresher.scheduleAnalyticsRefresh();
    const finalRefreshPromise = analyticsRefresher.scheduleAnalyticsRefresh();

    // wait for longer than the debounce time, so the just scheduled refresh would want to start,
    // but should still be running the second refresh
    await sleep(REFRESH_DEBOUNCE_TIME + 10);
    expect(isRefreshRunning).to.equal(true);
    expect(refreshNumber).to.equal(2);

    // wait for final refresh to complete, then check a total of three were called
    await finalRefreshPromise;
    expect(isRefreshRunning).to.equal(false);
    expect(refreshNumber).to.equal(3);
    expect(AnalyticsRefresher.executeRefresh).to.have.been.calledThrice;

    AnalyticsRefresher.executeRefresh.restore();
  });
});
