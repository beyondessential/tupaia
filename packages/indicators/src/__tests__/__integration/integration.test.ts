/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable jest/expect-expect */

import { createJestMockInstance } from '@tupaia/utils';
import { getTestModels, setupTest } from '@tupaia/database';
import { IndicatorApi } from '../../IndicatorApi';
import { Analytic, FetchOptions } from '../../types';
import {
  arithmeticAnalyticFixtures,
  eventCheckConditionsFixtures,
  indicatorApiFixtures,
} from './fixtures';

interface TestCase {
  input: {
    indicatorCodes: string[];
    fetchOptions: FetchOptions;
  };
  expected: Analytic[] | string;
  throws?: boolean;
}

const models = getTestModels();
// FIXME: possibly use createAggregator test util fn
const mockAggregator = createJestMockInstance('@tupaia/aggregator', 'Aggregator');
const api = new IndicatorApi(models, mockAggregator);

const runTestCase = async (testCase: TestCase) => {
  const { input, expected, throws } = testCase;
  const { indicatorCodes, fetchOptions } = input;

  const expectedPromise = api.buildAnalytics(indicatorCodes, fetchOptions);
  if (throws) {
    return expect(expectedPromise).toBeRejectedWith(expected as string);
  }
  return expect(expectedPromise).resolves.toStrictEqual(expected);
};

describe('Integration tests', () => {
  describe('Indicator API features', () => {
    const { setup, testCases } = indicatorApiFixtures;

    beforeAll(async () => {
      await setupTest(models, setup);
    });

    testCases.forEach(testCase => {
      it(testCase.description, async () => {
        await runTestCase(testCase);
      });
    });
  });

  describe('Arithmetic analytics', () => {
    const { setup, testCases } = arithmeticAnalyticFixtures;

    beforeAll(async () => {
      await setupTest(models, setup);
    });

    testCases.forEach(testCase => {
      it(testCase.description, async () => {
        await runTestCase(testCase);
      });
    });
  });

  describe('Event check conditions', () => {
    const { setup, testCases } = eventCheckConditionsFixtures;

    beforeAll(async () => {
      await setupTest(models, setup);
    });

    testCases.forEach(testCase => {
      it(testCase.description, async () => {
        await runTestCase(testCase);
      });
    });
  });
});
