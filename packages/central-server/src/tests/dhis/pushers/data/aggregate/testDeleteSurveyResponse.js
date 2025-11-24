import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import sinon from 'sinon';
import { generateId, populateTestData } from '@tupaia/database';
import { AggregateDataPusher } from '../../../../../dhis/pushers/data/aggregate/AggregateDataPusher';
import { setupDummySyncQueue } from '../../../../testUtilities';
import {
  DATA_SET_COMPLETION_DIMENSIONS,
  DATA_SET,
  getFailedSyncLog,
  getSyncLog,
  SURVEY_RESPONSE_CHANGE,
  SURVEY_RESPONSE_DATA_VALUE_DIMENSIONS,
  SURVEY_RESPONSE,
  SURVEY,
  SERVER_NAME,
} from './AggregateDataPusher.fixtures';

export const testDeleteSurveyResponse = (dhisApi, models, dataBroker) => {
  it('should mark as successful if the survey response never attempted to sync', async () => {
    const change = await models.dhisSyncQueue.findById(SURVEY_RESPONSE_CHANGE.id);
    change.type = 'delete';
    const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);

    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dataBroker.push).not.to.have.been.called;
    expect(dataBroker.delete).not.to.have.been.called;
  });

  it('should mark as successful if the survey response never successfully synced', async () => {
    const change = await models.dhisSyncQueue.findById(SURVEY_RESPONSE_CHANGE.id);
    change.type = 'delete';
    await populateTestData(models, { dhisSyncLog: [getFailedSyncLog(change)] });

    const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);
    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dataBroker.push).not.to.have.been.called;
    expect(dataBroker.delete).not.to.have.been.called;
  });

  it('should delete if the survey response previously synced successfully', async () => {
    const change = await models.dhisSyncQueue.findById(SURVEY_RESPONSE_CHANGE.id);
    change.type = 'delete';
    await populateTestData(models, { dhisSyncLog: [getSyncLog(change)] });
    const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);

    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dataBroker.push).not.to.have.been.called;
    expect(dataBroker.delete).to.have.been.calledWith(
      {
        code: SURVEY_RESPONSE_DATA_VALUE_DIMENSIONS.code,
        type: pusher.dataSourceTypes.DATA_ELEMENT,
      },
      SURVEY_RESPONSE_DATA_VALUE_DIMENSIONS,
      { serverName: SERVER_NAME },
    );
  });
  it('should delete the data set complete registration if one exists', async () => {
    try {
      dhisApi.getDataSetByCode = sinon.stub().returns(DATA_SET); // change to return valid data set
      const change = await models.dhisSyncQueue.findById(SURVEY_RESPONSE_CHANGE.id);
      change.type = 'delete';
      await populateTestData(models, { dhisSyncLog: [getSyncLog(change)] });
      const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);

      const result = await pusher.push();
      expect(result).to.be.true;
      expect(dhisApi.getDataSetByCode).to.have.been.calledOnceWith(SURVEY.code);
      expect(dhisApi.postDataSetCompletion).not.to.have.been.called;
      expect(dhisApi.deleteDataSetCompletion).to.have.been.calledOnceWith(
        DATA_SET_COMPLETION_DIMENSIONS,
      );
    } finally {
      dhisApi.getDataSetByCode = sinon.stub().returns(null); // switch back to returning null
    }
  });
  it('should not delete the data set complete registration if no data set matches', async () => {
    const change = await models.dhisSyncQueue.findById(SURVEY_RESPONSE_CHANGE.id);
    change.type = 'delete';
    await populateTestData(models, { dhisSyncLog: [getSyncLog(change)] });
    const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);

    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dhisApi.getDataSetByCode).to.have.been.calledOnceWith(SURVEY.code);
    expect(dhisApi.postDataSetCompletion).not.to.have.been.called;
    expect(dhisApi.deleteDataSetCompletion).not.to.have.been.called;
  });
  it('should add "next most recent" records to sync queue', async () => {
    // create an survey response that should be pushed to dhis2 if the current one is deleted
    const nextMostRecentSurveyResponse = {
      ...SURVEY_RESPONSE,
      id: generateId(),
      data_time: '2019-05-20T12:05',
    };
    await populateTestData(models, { surveyResponse: [nextMostRecentSurveyResponse] });

    // delete the original survey response
    await models.surveyResponse.deleteById(SURVEY_RESPONSE.id);
    const change = await models.dhisSyncQueue.findById(SURVEY_RESPONSE_CHANGE.id);
    change.type = 'delete';
    await populateTestData(models, { dhisSyncLog: [getSyncLog(change)] });

    // set up dummy sync queue to listen for changes
    const syncQueue = setupDummySyncQueue(models);

    // run the delete push
    const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);
    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dataBroker.push).not.to.have.been.called;
    expect(dataBroker.delete).to.have.been.calledWith(
      {
        code: SURVEY_RESPONSE_DATA_VALUE_DIMENSIONS.code,
        type: pusher.dataSourceTypes.DATA_ELEMENT,
      },
      SURVEY_RESPONSE_DATA_VALUE_DIMENSIONS,
      { serverName: SERVER_NAME },
    );

    // the one we added earlier should now have been added to the sync queue as the other was deleted
    const additionalChangeAfter = await syncQueue.getChange(nextMostRecentSurveyResponse.id);
    expect(additionalChangeAfter).to.have.property('type', 'update');
  });
};
