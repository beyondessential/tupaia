/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable max-classes-per-file */

import { Aggregator } from '@tupaia/aggregator';
import { DataBroker } from '@tupaia/data-broker';
import { IndicatorApi } from '../IndicatorApi';
import { Indicator, IndicatorType, ModelRegistry } from '../types';

const MOCK_BUILDERS = {
  testArithmetic: {
    buildAnalyticValues: jest
      .fn()
      .mockResolvedValue([{ organisationUnit: 'TO', period: '2019', value: 1 }]),
  },
  testAnalyticCount: {
    buildAnalyticValues: jest.fn().mockResolvedValue([
      { organisationUnit: 'TO', period: '2018', value: 2 },
      { organisationUnit: 'PG', period: '2020', value: 3 },
    ]),
  },
};

const INDICATORS: Record<string, Indicator> = {
  MALARIA: {
    code: 'MALARIA',
    builder: 'testArithmetic',
    config: { formula: 'MALARIA_MALE + MALARIA_FEMALE' },
  },
  POSITIVE: {
    code: 'POSITIVE',
    builder: 'testAnalyticCount',
    config: { formula: 'MEASUREMENT > 0' },
  },
};

jest.mock('@tupaia/aggregator');
jest.mock('@tupaia/data-broker');
jest.mock('../Builder', () => ({
  createBuilder: (builderName: keyof typeof MOCK_BUILDERS) => MOCK_BUILDERS[builderName],
}));

describe('IndicatorApi', () => {
  const models: ModelRegistry = {
    indicator: {
      find: async ({ code: codes }) =>
        (codes as string[]).map(code => INDICATORS[code] as IndicatorType).filter(x => x),
    },
  };
  const dataBroker = new DataBroker();
  const api = new IndicatorApi(models, dataBroker);

  it('getAggregator()', () => {
    expect(api.getAggregator()).toBeInstanceOf(Aggregator);
  });

  describe('constructor()', () => {
    it('should inject the provided `dataBroker` into an `Aggregator` instance', () => {
      new IndicatorApi(models, dataBroker);
      expect(jest.requireMock('@tupaia/aggregator').Aggregator).toHaveBeenCalledOnceWith(
        dataBroker,
      );
    });
  });

  describe('buildAnalytics()', () => {
    it('calls `buildAnalyticsForIndicators` using correct params', async () => {
      const fetchOptions = { organisationUnitCodes: ['TO'] };
      const spy = jest.spyOn(api, 'buildAnalyticsForIndicators');

      await api.buildAnalytics(['MALARIA', 'POSITIVE'], fetchOptions);
      expect(spy).toHaveBeenCalledOnceWith([INDICATORS.MALARIA, INDICATORS.POSITIVE], fetchOptions);
    });
  });

  describe('buildAnalyticsForIndicators', () => {
    it('instantiates and calls all indicators using correct params', async () => {
      const fetchOptions = { organisationUnitCodes: ['TO'] };

      await api.buildAnalyticsForIndicators(
        [INDICATORS.MALARIA, INDICATORS.POSITIVE],
        fetchOptions,
      );
      expect(MOCK_BUILDERS.testArithmetic.buildAnalyticValues).toHaveBeenCalledOnceWith(
        INDICATORS.MALARIA.config,
        fetchOptions,
      );
      expect(MOCK_BUILDERS.testAnalyticCount.buildAnalyticValues).toHaveBeenCalledOnceWith(
        INDICATORS.POSITIVE.config,
        fetchOptions,
      );
    });

    it('returns all indicator results as analytics, sorted by period', async () =>
      expect(
        api.buildAnalyticsForIndicators([INDICATORS.MALARIA, INDICATORS.POSITIVE], {}),
      ).resolves.toStrictEqual([
        { dataElement: 'POSITIVE', organisationUnit: 'TO', period: '2018', value: 2 },
        { dataElement: 'MALARIA', organisationUnit: 'TO', period: '2019', value: 1 },
        { dataElement: 'POSITIVE', organisationUnit: 'PG', period: '2020', value: 3 },
      ]));
  });
});
