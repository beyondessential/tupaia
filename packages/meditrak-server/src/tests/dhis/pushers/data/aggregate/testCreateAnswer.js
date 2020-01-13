/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { generateTestId, populateTestData } from '../../../../testUtilities';
import { AggregateDataPusher } from '../../../../../dhis/pushers/data/aggregate/AggregateDataPusher';
import { ANSWER_CHANGE, ANSWER, ANSWER_DATA_VALUE, SURVEY_RESPONSE } from './testData';

export const testCreateAnswer = (dhisApi, models) => {
  it('should throw an error if the changed record was not found', async () => {
    const change = await models.dhisSyncQueue.findById(ANSWER_CHANGE.id);
    change.record_id = 'does_not_exist_xxxxxxxxx';
    const pusher = new AggregateDataPusher(models, change, dhisApi);
    expect(pusher.push()).to.be.rejectedWith(`No answer found for ${change.record_id}`);
    expect(dhisApi.postDataValueSets).not.to.have.been.called;
    expect(dhisApi.deleteDataValue).not.to.have.been.called;
  });

  it('should create a data value representing this answer', async () => {
    const change = await models.dhisSyncQueue.findById(ANSWER_CHANGE.id);
    const pusher = new AggregateDataPusher(models, change, dhisApi);

    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dhisApi.postDataValueSets).to.have.been.calledOnceWith([ANSWER_DATA_VALUE]);
    expect(dhisApi.deleteDataValue).not.to.have.been.called;
  });

  it('should respond true without posting data if there is existing, more recent data for the same period', async () => {
    const moreRecentSurveyResponse = {
      ...SURVEY_RESPONSE,
      id: generateTestId(),
      end_time: '2019-04-10T14:05+00',
    };
    const moreRecentAnswer = {
      ...ANSWER,
      id: generateTestId(),
      survey_response_id: moreRecentSurveyResponse.id,
    };
    await populateTestData({
      surveyResponse: [moreRecentSurveyResponse],
      answer: [moreRecentAnswer],
    });
    const change = await models.dhisSyncQueue.findById(ANSWER_CHANGE.id);
    const pusher = new AggregateDataPusher(models, change, dhisApi);
    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dhisApi.postDataValueSets).not.to.have.been.called;
    expect(dhisApi.deleteDataValue).not.to.have.been.called;
  });
};
