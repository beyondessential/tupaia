/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '@tupaia/aggregator';
import { DataBroker } from '@tupaia/data-broker';
import { IndicatorApi } from '../IndicatorApi';
import { IndicatorType, ModelRegistry } from '../types';

jest.mock('@tupaia/aggregator');
jest.mock('@tupaia/data-broker');
jest.mock('../builders', () => {
  const buildTestArithmetic = jest
    .fn()
    .mockResolvedValue([{ organisationUnit: 'TO', period: '2019', value: 1 }]);
  const buildTestAnalyticCount = jest.fn().mockResolvedValue([
    { organisationUnit: 'TO', period: '2018', value: 2 },
    { organisationUnit: 'PG', period: '2020', value: 3 },
  ]);

  return { buildTestArithmetic, buildTestAnalyticCount };
});

const INDICATORS: Record<string, Partial<IndicatorType>> = {
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
  WRONG_BUILDER: {
    code: 'WRONG_BUILDER',
    builder: ' wrong',
    config: {},
  },
};

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

  describe('buildAnalytics()', () => {
    it('should inject the provided `dataBroker` into an `Aggregator` instance', () => {
      new IndicatorApi(models, dataBroker);
      expect(jest.requireMock('@tupaia/aggregator').Aggregator).toHaveBeenCalledOnceWith(
        dataBroker,
      );
    });

    it('calls all indicators with the expected input', async () => {
      const fetchOptions = { organisationUnitCodes: ['TO'] };

      await api.buildAnalytics(['MALARIA', 'POSITIVE'], fetchOptions);
      expect(jest.requireMock('../builders').buildTestArithmetic).toHaveBeenCalledOnceWith({
        api,
        config: INDICATORS.MALARIA.config,
        fetchOptions,
      });
      expect(jest.requireMock('../builders').buildTestAnalyticCount).toHaveBeenCalledOnceWith({
        api,
        config: INDICATORS.POSITIVE.config,
        fetchOptions,
      });
    });

    it('returns all indicator results as analytics, sorted by period', async () =>
      expect(api.buildAnalytics(['MALARIA', 'POSITIVE'], {})).resolves.toStrictEqual([
        { dataElement: 'POSITIVE', organisationUnit: 'TO', period: '2018', value: 2 },
        { dataElement: 'MALARIA', organisationUnit: 'TO', period: '2019', value: 1 },
        { dataElement: 'POSITIVE', organisationUnit: 'PG', period: '2020', value: 3 },
      ]));

    it('throws an error if a specified builder does not exist', async () =>
      expect(api.buildAnalytics(['MALARIA', 'WRONG_BUILDER'], {})).toBeRejectedWith(
        /is not an indicator builder/,
      ));
  });
});
