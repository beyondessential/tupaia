/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { populateTestData } from '../../../../testUtilities';
import { AggregateDataPusher } from '../../../../../dhis/pushers/data/aggregate/AggregateDataPusher';
import {
  ANSWER_CHANGE,
  ANSWER,
  ANSWER_DATA_VALUE,
  ANSWER_DATA_VALUE_DIMENSIONS,
  getSyncLog,
} from './testData';

export const testUpdateAnswer = (dhisApi, models) => {
  it('should update the value of the previously synced data value if only the value has changed', async () => {
    await models.answer.updateById(ANSWER.id, { text: '4' });
    const change = await models.dhisSyncQueue.findById(ANSWER_CHANGE.id);
    const pusher = new AggregateDataPusher(models, change, dhisApi);

    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dhisApi.postDataValueSet).to.have.been.calledOnceWith({
      dataValues: [{ ...ANSWER_DATA_VALUE, value: '4' }],
    });
    expect(dhisApi.deleteDataValue).not.to.have.been.called;
  });
  it('should delete the previously synced data values, and post new values if the period has changed', async () => {
    const change = await models.dhisSyncQueue.findById(ANSWER_CHANGE.id);
    const previouslySyncedPeriod = '20190101';
    const syncLogRecord = getSyncLog(change);
    syncLogRecord.data.period = previouslySyncedPeriod;
    await populateTestData({ dhisSyncLog: [syncLogRecord] });
    const pusher = new AggregateDataPusher(models, change, dhisApi);

    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dhisApi.postDataValueSet).to.have.been.calledOnceWith({
      dataValues: [ANSWER_DATA_VALUE],
    });
    expect(dhisApi.deleteDataValue).to.have.been.calledWith({
      ...ANSWER_DATA_VALUE_DIMENSIONS,
      period: previouslySyncedPeriod,
    });
  });
  it('should delete the previously synced data values, and post new values if the organisation unit has changed', async () => {
    const change = await models.dhisSyncQueue.findById(ANSWER_CHANGE.id);
    const previouslySyncedOrgUnit = 'AAA1';
    const syncLogRecord = getSyncLog(change);
    syncLogRecord.data.orgUnit = previouslySyncedOrgUnit;
    await populateTestData({ dhisSyncLog: [syncLogRecord] });
    const pusher = new AggregateDataPusher(models, change, dhisApi);

    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dhisApi.postDataValueSet).to.have.been.calledOnceWith({
      dataValues: [ANSWER_DATA_VALUE],
    });
    expect(dhisApi.deleteDataValue).to.have.been.calledWith({
      ...ANSWER_DATA_VALUE_DIMENSIONS,
      orgUnit: previouslySyncedOrgUnit,
    });
  });
};
