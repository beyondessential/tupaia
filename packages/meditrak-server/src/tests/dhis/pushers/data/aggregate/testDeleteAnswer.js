/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { generateTestId, populateTestData } from '../../../../testUtilities';
import { AggregateDataPusher } from '../../../../../dhis/pushers/data/aggregate/AggregateDataPusher';
import { DummySyncQueue } from '../../../../DummySyncQueue';
import {
  ANSWER_CHANGE,
  ANSWER,
  ANSWER_DATA_VALUE_DIMENSIONS,
  SURVEY_RESPONSE,
  getFailedSyncLog,
  getSyncLog,
  SERVER_NAME,
} from './testData';

export const testDeleteAnswer = (dhisApi, models, dataBroker) => {
  afterEach(async () => {
    // clean up temporary data
    await models.dhisSyncLog.delete({ id: { comparator: 'like', comparisonValue: '%_test%' } });
  });
  it('should mark as successful if the answer never attempted to sync', async () => {
    const change = await models.dhisSyncQueue.findById(ANSWER_CHANGE.id);
    change.type = 'delete';
    const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);

    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dataBroker.push).not.to.have.been.called;
    expect(dataBroker.delete).not.to.have.been.called;
  });
  it('should mark as successful if the answer never successfully synced', async () => {
    const change = await models.dhisSyncQueue.findById(ANSWER_CHANGE.id);
    change.type = 'delete';
    await populateTestData({ dhisSyncLog: [getFailedSyncLog(change)] });
    const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);

    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dataBroker.push).not.to.have.been.called;
    expect(dataBroker.delete).not.to.have.been.called;
  });
  it('should delete if the answer previously synced successfully', async () => {
    const change = await models.dhisSyncQueue.findById(ANSWER_CHANGE.id);
    change.type = 'delete';
    await populateTestData({ dhisSyncLog: [getSyncLog(change)] });
    const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);

    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dataBroker.push).not.to.have.been.called;
    expect(dataBroker.delete).to.have.been.calledWith(
      { code: ANSWER_DATA_VALUE_DIMENSIONS.code, type: pusher.dataSourceTypes.DATA_ELEMENT },
      ANSWER_DATA_VALUE_DIMENSIONS,
      { serverName: SERVER_NAME },
    );
  });

  it('should add "next most recent" records to sync queue', async () => {
    // create an answer that should be pushed to dhis2 if the current one is deleted
    const nextMostRecentSurveyResponse = {
      ...SURVEY_RESPONSE,
      id: generateTestId(),
      submission_time: '2019-05-20T12:05+00',
    };
    const nextMostRecentAnswer = {
      ...ANSWER,
      id: generateTestId(),
      survey_response_id: nextMostRecentSurveyResponse.id,
      text: '3',
    };
    await populateTestData({
      surveyResponse: [nextMostRecentSurveyResponse],
      answer: [nextMostRecentAnswer],
    });

    // delete the original answer
    await models.answer.deleteById(ANSWER.id);
    const change = await models.dhisSyncQueue.findById(ANSWER_CHANGE.id);
    change.type = 'delete';
    await populateTestData({ dhisSyncLog: [getSyncLog(change)] });

    // set up dummy sync queue to listen for changes
    const syncQueue = new DummySyncQueue();
    models.addChangeHandlerForCollection(models.answer.databaseType, syncQueue.add);

    // run the delete push
    const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);
    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dataBroker.push).not.to.have.been.called;
    expect(dataBroker.delete).to.have.been.calledWith(
      { code: ANSWER_DATA_VALUE_DIMENSIONS.code, type: pusher.dataSourceTypes.DATA_ELEMENT },
      ANSWER_DATA_VALUE_DIMENSIONS,
      { serverName: SERVER_NAME },
    );

    // the one we added earlier should now have been added to the sync queue as the other was deleted
    const additionalChangeAfter = await syncQueue.getChange(nextMostRecentAnswer.id);
    expect(additionalChangeAfter).to.have.property('type', 'update');
  });
};
