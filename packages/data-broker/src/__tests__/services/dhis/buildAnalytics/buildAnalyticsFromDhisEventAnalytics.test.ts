/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildAnalyticsFromDhisEventAnalytics } from '../../../../services/dhis/buildAnalytics/buildAnalyticsFromDhisEventAnalytics';
import { DhisEventAnalytics } from '../../../../services/dhis/types';
import { Analytic } from '../../../../types';
import { EVENT_ANALYTICS } from './buildAnalytics.fixtures';

describe('buildAnalyticsFromDhisEventAnalytics', () => {
  it('allows empty data element codes', () => {
    expect(() =>
      buildAnalyticsFromDhisEventAnalytics(EVENT_ANALYTICS.withDataValues),
    ).not.toThrowError();
    expect(() =>
      buildAnalyticsFromDhisEventAnalytics(EVENT_ANALYTICS.withDataValues, []),
    ).not.toThrowError();
  });

  it('returns an object with `results` and `metadata` fields', () => {
    const response = buildAnalyticsFromDhisEventAnalytics(EVENT_ANALYTICS.withDataValues);
    expect(response).toContainKeys(['results', 'metadata']);
  });

  describe('`results`', () => {
    const testData: [string, [DhisEventAnalytics, string[]], Analytic[]][] = [
      ['empty data element codes', [EVENT_ANALYTICS.withDataValues, []], []],
      ['empty rows', [EVENT_ANALYTICS.noDataValues, ['BCD1', 'BCD2']], []],
      [
        'non empty rows - results should be sorted by period',
        [EVENT_ANALYTICS.withDataValues, ['BCD1', 'BCD2']],
        [
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
        ],
      ],
      ['empty rows', [EVENT_ANALYTICS.noDataValues, ['BCD1', 'BCD2']], []],
    ];

    it.each(testData)('%s', (_, [eventAnalytics, dataElementCodes], value) => {
      expect(buildAnalyticsFromDhisEventAnalytics(eventAnalytics, dataElementCodes)).toHaveProperty(
        'results',
        value,
      );
    });
  });

  describe('`metadata`', () => {
    it('empty data element codes', () => {
      expect(
        buildAnalyticsFromDhisEventAnalytics(EVENT_ANALYTICS.withDataValues),
      ).toHaveProperty('metadata', { dataElementCodeToName: {} });
    });

    it('non empty data element codes', () => {
      const dataElementCodes = ['BCD1', 'BCD2'];
      const dataElementCodeToName = {
        BCD1: 'Population',
        BCD2: 'Comment',
      };

      expect(
        buildAnalyticsFromDhisEventAnalytics(EVENT_ANALYTICS.emptyRows, dataElementCodes),
      ).toHaveProperty('metadata', { dataElementCodeToName });
      expect(
        buildAnalyticsFromDhisEventAnalytics(EVENT_ANALYTICS.withDataValues, dataElementCodes),
      ).toHaveProperty('metadata', { dataElementCodeToName });
    });
  });
});
