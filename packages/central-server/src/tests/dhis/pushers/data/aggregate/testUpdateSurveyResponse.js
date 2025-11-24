import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { populateTestData } from '@tupaia/database';
import { AggregateDataPusher } from '../../../../../dhis/pushers/data/aggregate/AggregateDataPusher';
import {
  SURVEY_RESPONSE_DATA_VALUE,
  SURVEY_RESPONSE_DATA_VALUE_DIMENSIONS,
  SURVEY_RESPONSE_CHANGE,
  getSyncLog,
  SERVER_NAME,
} from './AggregateDataPusher.fixtures';

export const testUpdateSurveyResponse = (dhisApi, models, dataBroker) => {
  it('should delete the previously synced data values, and post new values if the period has changed', async () => {
    const change = await models.dhisSyncQueue.findById(SURVEY_RESPONSE_CHANGE.id);
    const previouslySyncedPeriod = '20190101';
    const syncLogRecord = getSyncLog(change);
    syncLogRecord.data.period = previouslySyncedPeriod;
    await populateTestData(models, { dhisSyncLog: [syncLogRecord] });
    const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);

    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dataBroker.push).to.have.been.calledOnceWith(
      { code: SURVEY_RESPONSE_DATA_VALUE.code, type: pusher.dataSourceTypes.DATA_ELEMENT },
      SURVEY_RESPONSE_DATA_VALUE,
    );
    expect(dataBroker.delete).to.have.been.calledWith(
      {
        code: SURVEY_RESPONSE_DATA_VALUE_DIMENSIONS.code,
        type: pusher.dataSourceTypes.DATA_ELEMENT,
      },
      {
        ...SURVEY_RESPONSE_DATA_VALUE_DIMENSIONS,
        period: previouslySyncedPeriod,
      },
      { serverName: SERVER_NAME },
    );
  });
  it('should delete the previously synced data values, and post new values if the organisation unit has changed', async () => {
    const change = await models.dhisSyncQueue.findById(SURVEY_RESPONSE_CHANGE.id);
    const previouslySyncedOrgUnit = 'AAA1';
    const syncLogRecord = getSyncLog(change);
    syncLogRecord.data.orgUnit = previouslySyncedOrgUnit;
    await populateTestData(models, { dhisSyncLog: [syncLogRecord] });
    const pusher = new AggregateDataPusher(models, change, dhisApi, dataBroker);

    const result = await pusher.push();
    expect(result).to.be.true;
    expect(dataBroker.push).to.have.been.calledOnceWith(
      { code: SURVEY_RESPONSE_DATA_VALUE.code, type: pusher.dataSourceTypes.DATA_ELEMENT },
      SURVEY_RESPONSE_DATA_VALUE,
    );
    expect(dataBroker.delete).to.have.been.calledWith(
      {
        code: SURVEY_RESPONSE_DATA_VALUE_DIMENSIONS.code,
        type: pusher.dataSourceTypes.DATA_ELEMENT,
      },
      {
        ...SURVEY_RESPONSE_DATA_VALUE_DIMENSIONS,
        orgUnit: previouslySyncedOrgUnit,
      },
      { serverName: SERVER_NAME },
    );
  });
};
