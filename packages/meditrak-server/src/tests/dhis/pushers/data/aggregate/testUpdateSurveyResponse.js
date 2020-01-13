/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { populateTestData } from '../../../../testUtilities';
import { AggregateDataPusher } from '../../../../../dhis/pushers/data/aggregate/AggregateDataPusher';
import {
  SURVEY_RESPONSE_DATA_VALUE,
  SURVEY_RESPONSE_DATA_VALUE_DIMENSIONS,
  SURVEY_RESPONSE_CHANGE,
  getSyncLog,
} from './testData';

export const testUpdateSurveyResponse = (dhisApi, models) => {
  it('should delete the previously synced data values, and post new values if the period has changed', async () => {
    const change = await models.dhisSyncQueue.findById(SURVEY_RESPONSE_CHANGE.id);
    const previouslySyncedPeriod = '20190101';
    const syncLogRecord = getSyncLog(change);
    syncLogRecord.data.period = previouslySyncedPeriod;
    await populateTestData({ dhisSyncLog: [syncLogRecord] });
    const pusher = new AggregateDataPusher(models, change, dhisApi);

    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dhisApi.postDataValueSets).to.have.been.calledOnceWith({
      dataValues: [SURVEY_RESPONSE_DATA_VALUE],
    });
    expect(dhisApi.deleteDataValue).to.have.been.calledWith({
      ...SURVEY_RESPONSE_DATA_VALUE_DIMENSIONS,
      period: previouslySyncedPeriod,
    });
  });
  it('should delete the previously synced data values, and post new values if the organisation unit has changed', async () => {
    const change = await models.dhisSyncQueue.findById(SURVEY_RESPONSE_CHANGE.id);
    const previouslySyncedOrgUnit = 'AAA1';
    const syncLogRecord = getSyncLog(change);
    syncLogRecord.data.orgUnit = previouslySyncedOrgUnit;
    await populateTestData({ dhisSyncLog: [syncLogRecord] });
    const pusher = new AggregateDataPusher(models, change, dhisApi);

    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dhisApi.postDataValueSets).to.have.been.calledOnceWith({
      dataValues: [SURVEY_RESPONSE_DATA_VALUE],
    });
    expect(dhisApi.deleteDataValue).to.have.been.calledWith({
      ...SURVEY_RESPONSE_DATA_VALUE_DIMENSIONS,
      orgUnit: previouslySyncedOrgUnit,
    });
  });
};
