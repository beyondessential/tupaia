/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import { expect } from 'chai';
import { it, describe } from 'mocha';

import { findLatestPeriod } from '/apiV1/utils/findLatestPeriod';

const surveyDatesResponseDataValues = [
  {
    dataElement: 'tEs7okyAUwe',
    period: '20170629',
    orgUnit: 'XgfqpmLITGT',
    categoryOptionCombo: 'HllvX50cXC0',
    attributeOptionCombo: 'HllvX50cXC0',
    value: '2017-06-29',
    storedBy: 'TupaiaApp',
    created: '2018-01-19T07:19:33.000+0000',
    lastUpdated: '2018-01-19T07:19:33.000+0000',
    followUp: false,
  },
  {
    dataElement: 'tEs7okyAUwe',
    period: '20181214',
    orgUnit: 'XgfqpmLITGT',
    categoryOptionCombo: 'HllvX50cXC0',
    attributeOptionCombo: 'HllvX50cXC0',
    value: '2018-12-14',
    storedBy: 'TupaiaApp',
    created: '2018-12-13T23:22:09.000+0000',
    lastUpdated: '2018-12-13T23:22:09.000+0000',
    followUp: false,
  },
];

describe('findLatestPeriod', () => {
  it('should return results for the latest period', () => {
    try {
      const result = findLatestPeriod(surveyDatesResponseDataValues);
      expect(result).to.equal('20181214');
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  });
});
