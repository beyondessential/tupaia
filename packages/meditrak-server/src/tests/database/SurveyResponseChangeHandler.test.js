/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { buildAndInsertSurveys, buildAndInsertSurveyResponses } from '@tupaia/database';
import { sleep } from '@tupaia/utils';
import { SurveyResponseChangeHandler } from '../../database';
import { getModels } from '../testUtilities';

const SURVEY = {
  code: 'Test_ChangeHandler',
  questions: [{ code: 'Test_ChangeHandler1', type: 'Number' }],
};

describe('SurveyResponseChangeHandler', () => {
  const models = getModels();

  before(async () => {
    await buildAndInsertSurveys(models, [SURVEY]);
  });

  it('batches multiple changes', async () => {
    const changeHandler = new SurveyResponseChangeHandler(models, 250);

    try {
      changeHandler.updateOutdatedStatus = sinon.stub().callsFake(async () => {
        changeHandler.resolveScheduledUpdatePromise();
      });

      changeHandler.listenForChanges();

      // make a bunch of different changes, with small delays between each to model real life
      const sleepTime = 100;

      // create
      const surveyResponseIds = [];
      for (let i = 0; i < 3; i++) {
        const [{ surveyResponse }] = await buildAndInsertSurveyResponses(models, [
          {
            surveyCode: 'Test_ChangeHandler',
            answers: { Test_ChangeHandler1: 1 },
          },
        ]);
        surveyResponseIds.push(surveyResponse.id);
        await sleep(sleepTime);
      }

      // update
      await models.surveyResponse.update({ id: surveyResponseIds[0] }, { data_time: '2021-07-01' });
      await sleep(sleepTime);

      // delete
      await models.surveyResponse.delete({ id: surveyResponseIds[1] });
      await sleep(sleepTime);

      await models.database.waitForAllChangeHandlers();
      expect(changeHandler.updateOutdatedStatus).to.have.callCount(1);
    } finally {
      changeHandler.stopListeningForChanges();
    }
  });
});
