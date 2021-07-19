/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { sleep } from '@tupaia/utils';
import { SurveyResponseOutdater } from '../../cachers/SurveyResponseOutdater';
import { getTestModels } from '../../testUtilities/getTestDatabase';
import { buildAndInsertSurveys, buildAndInsertSurveyResponses } from '../../testUtilities';

const SURVEY = {
  code: 'Test_ChangeHandler',
  questions: [{ code: 'Test_ChangeHandler1', type: 'Number' }],
};

describe('SurveyResponseChangeHandler', () => {
  const models = getTestModels();

  before(async () => {
    await buildAndInsertSurveys(models, [SURVEY]);
  });

  it('batches multiple changes', async () => {
    const outdater = new SurveyResponseOutdater(models, 250);

    try {
      outdater.updateOutdatedStatus = sinon.stub().callsFake(async () => {
        outdater.resolveScheduledUpdatePromise();
      });

      outdater.listenForChanges();

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
      expect(outdater.updateOutdatedStatus).to.have.callCount(1);
    } finally {
      outdater.stopListeningForChanges();
    }
  });
});
