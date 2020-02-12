/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';
import sinon from 'sinon';
import { expect } from 'chai';
import { AggregateDataPusher } from '../../../../../dhis/pushers/data/aggregate/AggregateDataPusher';
import {
  ANSWER_CHANGE,
  ANSWER_DATA_VALUE,
  SURVEY_RESPONSE,
  WEEKLY_DATA_SET,
  DAILY_DATA_SET,
  MONTHLY_DATA_SET,
  YEARLY_DATA_SET,
} from './testData';

export const testPeriodsBasedOnDataSet = (dhisApi, models) => {
  const testPeriodType = async (dataSet, format) => {
    try {
      dhisApi.getDataSetByCode = sinon.stub().returns(dataSet); // change to return valid data set
      const change = await models.dhisSyncQueue.findById(ANSWER_CHANGE.id);
      const pusher = new AggregateDataPusher(models, change, dhisApi);

      const result = await pusher.push();
      expect(result).to.be.true;
      const expectedPeriod = moment(SURVEY_RESPONSE.submission_time).format(format);
      expect(dhisApi.postDataValueSets).to.have.been.calledOnceWith([
        { ...ANSWER_DATA_VALUE, period: expectedPeriod },
      ]);
      expect(dhisApi.deleteDataValue).not.to.have.been.called;
    } finally {
      dhisApi.getDataSetByCode = sinon.stub().returns(null); // switch back to returning null
    }
  };

  it('should handle the daily period type', () => testPeriodType(DAILY_DATA_SET, 'YYYYMMDD'));

  it('should handle the weekly period type', () => testPeriodType(WEEKLY_DATA_SET, 'YYYY[W]W'));

  it('should handle the monthly period type', () => testPeriodType(MONTHLY_DATA_SET, 'YYYYMM'));

  it('should handle the yearly period type', () => testPeriodType(YEARLY_DATA_SET, 'YYYY'));

  it('should default to daily when no data set is attached', () =>
    testPeriodType(null, 'YYYYMMDD'));
};
