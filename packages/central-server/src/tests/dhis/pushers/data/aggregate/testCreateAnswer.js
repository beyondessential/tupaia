import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { generateId, populateTestData } from '@tupaia/database';
import { AggregateDataPusher } from '../../../../../dhis/pushers/data/aggregate/AggregateDataPusher';
import {
  ANSWER_CHANGE,
  ANSWER,
  ANSWER_DATA_VALUE,
  SURVEY_RESPONSE,
} from './AggregateDataPusher.fixtures';

export const testCreateAnswer = (dhisApi, models, dataBroker) => {
  it('should throw an error if the changed record was not found', async () => {
    const change = await models.dhisSyncQueue.findById(ANSWER_CHANGE.id);
    change.record_id = 'does_not_exist_xxxxxxxxx';
    const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);
    await expect(pusher.push()).to.eventually.equal(false);
    expect(dataBroker.push).not.to.have.been.called;
    expect(dataBroker.delete).not.to.have.been.called;
  });

  it('should create a data value representing this answer', async () => {
    const change = await models.dhisSyncQueue.findById(ANSWER_CHANGE.id);
    const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);

    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dataBroker.push).to.have.been.calledOnceWith(
      { code: ANSWER_DATA_VALUE.code, type: pusher.dataSourceTypes.DATA_ELEMENT },
      ANSWER_DATA_VALUE,
    );
    expect(dataBroker.delete).not.to.have.been.called;
  });

  it('should respond true without posting data if there is existing, more recent data for the same period', async () => {
    const moreRecentSurveyResponse = {
      ...SURVEY_RESPONSE,
      id: generateId(),
      end_time: '2019-04-10T14:05+00',
    };
    const moreRecentAnswer = {
      ...ANSWER,
      id: generateId(),
      survey_response_id: moreRecentSurveyResponse.id,
    };
    await populateTestData(models, {
      surveyResponse: [moreRecentSurveyResponse],
      answer: [moreRecentAnswer],
    });
    const change = await models.dhisSyncQueue.findById(ANSWER_CHANGE.id);
    const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);
    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dataBroker.push).not.to.have.been.called;
    expect(dataBroker.delete).not.to.have.been.called;
  });
};
