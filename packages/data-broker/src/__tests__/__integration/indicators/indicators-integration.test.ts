/* eslint-disable jest/expect-expect */

import { getTestModels, setupTest } from '@tupaia/database';
import type { FetchOptions } from '@tupaia/indicators';
import {
  arithmeticAnalyticFixtures,
  eventCheckConditionsFixtures,
  indicatorApiFixtures,
} from './fixtures';
import { Analytic, DataBrokerModelRegistry } from '../../../types';
import { DataBroker } from '../../../DataBroker';

interface TestCase {
  input: {
    indicatorCodes: string[];
    fetchOptions: FetchOptions;
  };
  expected: Analytic[] | string;
  throws?: boolean;
}

const models = (getTestModels() as unknown) as DataBrokerModelRegistry;
const dataBroker = new DataBroker();

const runTestCase = async (testCase: TestCase) => {
  const { input, expected, throws } = testCase;
  const { indicatorCodes, fetchOptions } = input;

  const run = async () => {
    const pullAnalyticsResult = await dataBroker.pullAnalytics(indicatorCodes, fetchOptions);
    if (pullAnalyticsResult.results.length > 1) {
      throw new Error('Too many result sets');
    }
    const [resultSet] = pullAnalyticsResult.results;
    return resultSet.analytics;
  };
  if (throws) {
    return expect(run()).toBeRejectedWith(expected as string);
  }
  return expect(run()).resolves.toStrictEqual(expected);
};

describe('Integration tests', () => {
  afterAll(async () => {
    await dataBroker.close();
  });

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
