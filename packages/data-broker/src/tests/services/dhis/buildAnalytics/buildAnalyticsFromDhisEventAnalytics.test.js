/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { buildAnalyticsFromDhisEventAnalytics } from '../../../../services/dhis/buildAnalytics/buildAnalyticsFromDhisEventAnalytics';
import { EVENT_ANALYTICS } from './buildAnalytics.fixtures';

describe('buildAnalyticsFromDhisEventAnalytics', () => {
  it('allows empty data element codes', () => {
    expect(() =>
      buildAnalyticsFromDhisEventAnalytics(EVENT_ANALYTICS.withDataValues),
    ).to.not.throw();
    expect(() =>
      buildAnalyticsFromDhisEventAnalytics(EVENT_ANALYTICS.withDataValues, []),
    ).to.not.throw();
  });

  it('returns an object with `results` and `metadata` fields', () => {
    const response = buildAnalyticsFromDhisEventAnalytics(EVENT_ANALYTICS.withDataValues);
    expect(response).to.have.property('results');
    expect(response).to.have.property('metadata');
  });

  describe('`results`', () => {
    it('empty data element codes', () => {
      expect(
        buildAnalyticsFromDhisEventAnalytics(EVENT_ANALYTICS.withDataValues, []),
      ).to.have.deep.property('results', []);
    });

    it('empty rows', () => {
      expect(
        buildAnalyticsFromDhisEventAnalytics(EVENT_ANALYTICS.noDataValues, ['BCD1', 'BCD2']),
      ).to.have.deep.property('results', []);
    });

    it('non empty rows - results should be sorted by period', () => {
      expect(
        buildAnalyticsFromDhisEventAnalytics(EVENT_ANALYTICS.withDataValues, ['BCD1', 'BCD2']),
      ).to.have.deep.property('results', [
        {
          period: '20200206',
          organisationUnit: 'TO_Nukuhc',
          dataElement: 'BCD1',
          value: 10,
        },
        {
          period: '20200206',
          organisationUnit: 'TO_Nukuhc',
          dataElement: 'BCD2',
          value: 'Comment 1',
        },
        {
          period: '20200207',
          organisationUnit: 'TO_HvlMCH',
          dataElement: 'BCD1',
          value: 20,
        },
        {
          period: '20200207',
          organisationUnit: 'TO_HvlMCH',
          dataElement: 'BCD2',
          value: 'Comment 2',
        },
      ]);
    });
  });

  describe('`metadata`', () => {
    it('empty data element codes', () => {
      expect(
        buildAnalyticsFromDhisEventAnalytics(EVENT_ANALYTICS.withDataValues),
      ).to.have.deep.property('metadata', {
        dataElementCodeToName: {},
      });
    });

    it('non empty data element codes', () => {
      const dataElementCodes = ['BCD1', 'BCD2'];
      const dataElementCodeToName = {
        BCD1: 'Population',
        BCD2: 'Comment',
      };

      expect(
        buildAnalyticsFromDhisEventAnalytics(EVENT_ANALYTICS.emptyRows, dataElementCodes),
      ).to.have.deep.property('metadata', { dataElementCodeToName });
      expect(
        buildAnalyticsFromDhisEventAnalytics(EVENT_ANALYTICS.withDataValues, dataElementCodes),
      ).to.have.deep.property('metadata', { dataElementCodeToName });
    });
  });
});
