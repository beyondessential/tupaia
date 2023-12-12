/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { buildAndInsertSurveys, populateTestData } from '@tupaia/database';
import { getModels, resetTestData } from '../../../../testUtilities';
import { Pusher } from '../../../../../dhis/pushers/Pusher';
import { BASELINE_TEST_DATA, QUESTION, SURVEY } from './AggregateDataPusher.fixtures';
import { createDhisApiStub } from './createDhisApiStub';
import { testCreateAnswer } from './testCreateAnswer';
import { testCreateSurveyResponse } from './testCreateSurveyResponse';
import { testDeleteAnswer } from './testDeleteAnswer';
import { testDeleteSurveyResponse } from './testDeleteSurveyResponse';
import { testUpdateAnswer } from './testUpdateAnswer';
import { testUpdateSurveyResponse } from './testUpdateSurveyResponse';
import { testPeriodsBasedOnDataSet } from './testPeriodsBasedOnDataSet';
import { createDataBrokerStub } from './createDataBrokerStub';

describe('AggregateDataPusher', () => {
  const models = getModels();
  const dhisApi = createDhisApiStub();
  const dataBroker = createDataBrokerStub();

  describe('push()', () => {
    beforeAll(() => {
      jest.spyOn(Pusher.prototype, 'logResults').mockImplementation();
    });

    beforeEach(async () => {
      // populate default test data
      await buildAndInsertSurveys(models, [{ ...SURVEY, questions: [QUESTION] }]);
      await populateTestData(models, BASELINE_TEST_DATA);
    });

    afterEach(async () => {
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
