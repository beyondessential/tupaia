/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import winston from 'winston';
import * as DataBroker from '@tupaia/data-broker';

import { populateTestData, insertSurveyAndScreens, resetTestData } from '../../../../testUtilities';
import { Pusher } from '../../../../../dhis/pushers/Pusher';
import { getModels } from '../../../../getModels';
import { createDhisApiStub, resetDhisApiStubHistory } from './createDhisApiStub';
import { BASELINE_TEST_DATA, QUESTION, SURVEY } from './testData';
import { testCreateAnswer } from './testCreateAnswer';
import { testCreateSurveyResponse } from './testCreateSurveyResponse';
import { testDeleteAnswer } from './testDeleteAnswer';
import { testDeleteSurveyResponse } from './testDeleteSurveyResponse';
import { testUpdateAnswer } from './testUpdateAnswer';
import { testUpdateSurveyResponse } from './testUpdateSurveyResponse';
import { testPeriodsBasedOnDataSet } from './testPeriodsBasedOnDataSet';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('AggregateDataPusher', () => {
  const models = getModels();
  const dhisApi = createDhisApiStub();

  describe('push()', () => {
    before(async () => {
      // Suppress logging while running the tests
      sinon.stub(winston, 'error');
      sinon.stub(winston, 'warn');
      sinon.stub(Pusher.prototype, 'logResults');
      sinon.stub(DataBroker, 'getDhisApiInstance').returns(dhisApi);
    });

    after(() => {
      winston.error.restore();
      winston.warn.restore();
      Pusher.prototype.logResults.restore();
      DataBroker.getDhisApiInstance.restore();
    });

    beforeEach(async () => {
      // populate default test data
      await insertSurveyAndScreens({ survey: SURVEY, screens: [[QUESTION]] });
      await populateTestData(BASELINE_TEST_DATA);
    });

    afterEach(async () => {
      // reset spy calls after each test case
      resetDhisApiStubHistory(dhisApi);

      // clear test data
      await resetTestData();
    });

    describe('freshly created answer', () => testCreateAnswer(dhisApi, models));

    describe('freshly created survey response', () => testCreateSurveyResponse(dhisApi, models));

    describe('deleting an answer', () => testDeleteAnswer(dhisApi, models));

    describe('deleting a survey response', () => testDeleteSurveyResponse(dhisApi, models));

    describe('update to previously synced answer', () => testUpdateAnswer(dhisApi, models));

    describe('update to previously synced survey response', () =>
      testUpdateSurveyResponse(dhisApi, models));

    describe('periods based on data set period type', () =>
      testPeriodsBasedOnDataSet(dhisApi, models));
  });
});
