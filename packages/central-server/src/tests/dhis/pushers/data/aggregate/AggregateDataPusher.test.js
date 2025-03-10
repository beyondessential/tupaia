import sinon from 'sinon';

import { buildAndInsertSurveys, populateTestData } from '@tupaia/database';
import { getModels, resetTestData } from '../../../../testUtilities';
import { Pusher } from '../../../../../dhis/pushers/Pusher';
import { BASELINE_TEST_DATA, QUESTION, SURVEY } from './AggregateDataPusher.fixtures';
import { createDhisApiStub, resetDhisApiStubHistory } from './createDhisApiStub';
import { testCreateAnswer } from './testCreateAnswer';
import { testCreateSurveyResponse } from './testCreateSurveyResponse';
import { testDeleteAnswer } from './testDeleteAnswer';
import { testDeleteSurveyResponse } from './testDeleteSurveyResponse';
import { testUpdateAnswer } from './testUpdateAnswer';
import { testUpdateSurveyResponse } from './testUpdateSurveyResponse';
import { testPeriodsBasedOnDataSet } from './testPeriodsBasedOnDataSet';
import { createDataBrokerStub, resetDataBrokerStubHistory } from './createDataBrokerStub';

describe('AggregateDataPusher', () => {
  const models = getModels();
  const dhisApi = createDhisApiStub();
  const dataBroker = createDataBrokerStub();

  describe('push()', () => {
    before(async () => {
      sinon.stub(Pusher.prototype, 'logResults');
    });

    after(() => {
      Pusher.prototype.logResults.restore();
    });

    beforeEach(async () => {
      // populate default test data
      await buildAndInsertSurveys(models, [{ ...SURVEY, questions: [QUESTION] }]);
      await populateTestData(models, BASELINE_TEST_DATA);
    });

    afterEach(async () => {
      // reset spy calls after each test case
      resetDhisApiStubHistory(dhisApi);
      resetDataBrokerStubHistory(dataBroker);

      // clear test data
      await resetTestData();
    });

    describe('freshly created answer', () => testCreateAnswer(dhisApi, models, dataBroker));

    describe('freshly created survey response', () =>
      testCreateSurveyResponse(dhisApi, models, dataBroker));

    describe('deleting an answer', () => testDeleteAnswer(dhisApi, models, dataBroker));

    describe('deleting a survey response', () =>
      testDeleteSurveyResponse(dhisApi, models, dataBroker));

    describe('update to previously synced answer', () =>
      testUpdateAnswer(dhisApi, models, dataBroker));

    describe('update to previously synced survey response', () =>
      testUpdateSurveyResponse(dhisApi, models, dataBroker));

    describe('periods based on data set period type', () =>
      testPeriodsBasedOnDataSet(dhisApi, models, dataBroker));
  });
});
