import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import sinon from 'sinon';
import { generateId, populateTestData } from '@tupaia/database';
import { AggregateDataPusher } from '../../../../../dhis/pushers/data/aggregate/AggregateDataPusher';
import {
  SURVEY_RESPONSE_DATA_VALUE,
  SURVEY_RESPONSE_CHANGE,
  SURVEY_RESPONSE,
  SURVEY,
  DATA_SET,
  DATA_SET_COMPLETION,
} from './AggregateDataPusher.fixtures';

export const testCreateSurveyResponse = (dhisApi, models, dataBroker) => {
  it('should throw an error if the changed record was not found', async () => {
    const change = await models.dhisSyncQueue.findById(SURVEY_RESPONSE_CHANGE.id);
    change.record_id = 'does_not_exist_xxxxxxxxx';
    const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);
    await expect(pusher.push()).to.eventually.equal(false);
    expect(dataBroker.push).not.to.have.been.called;
    expect(dataBroker.delete).not.to.have.been.called;
  });

  it('should create a data value against the SurveyDate data element', async () => {
    const change = await models.dhisSyncQueue.findById(SURVEY_RESPONSE_CHANGE.id);
    const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);

    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dataBroker.push).to.have.been.calledOnceWith(
      { code: SURVEY_RESPONSE_DATA_VALUE.code, type: pusher.dataSourceTypes.DATA_ELEMENT },
      SURVEY_RESPONSE_DATA_VALUE,
    );
    expect(dataBroker.delete).not.to.have.been.called;
  });

  it('should respond true without posting data if there is existing, more recent data for the same period', async () => {
    const moreRecentSurveyResponse = {
      ...SURVEY_RESPONSE,
      id: generateId(),
      end_time: '2019-04-10T14:05+00',
    };
    await populateTestData(models, { surveyResponse: [moreRecentSurveyResponse] });
    const change = await models.dhisSyncQueue.findById(SURVEY_RESPONSE_CHANGE.id);
    const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);
    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dataBroker.push).not.to.have.been.called;
    expect(dataBroker.delete).not.to.have.been.called;
  });

  it('should create a data set complete registration if survey has a matching set', async () => {
    try {
      dhisApi.getDataSetByCode = sinon.stub().returns(DATA_SET); // change to return valid data set
      const change = await models.dhisSyncQueue.findById(SURVEY_RESPONSE_CHANGE.id);
      const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);

      const result = await pusher.push();
      expect(result).to.be.true;
      expect(dhisApi.getDataSetByCode).to.have.been.calledOnceWith(SURVEY.code);
      expect(dhisApi.postDataSetCompletion).to.have.been.calledOnceWith(DATA_SET_COMPLETION);
    } finally {
      dhisApi.getDataSetByCode = sinon.stub().returns(null); // switch back to returning null
    }
  });

  it('should not create a data set complete registration if no matching data set', async () => {
    const change = await models.dhisSyncQueue.findById(SURVEY_RESPONSE_CHANGE.id);
    const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);

    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dhisApi.getDataSetByCode).to.have.been.calledOnceWith(SURVEY.code);
    expect(dhisApi.postDataSetCompletion).not.to.have.been.called;
  });
};
