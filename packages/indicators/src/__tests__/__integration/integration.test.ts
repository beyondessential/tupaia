/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DataBroker } from '@tupaia/data-broker';
import { getTestModels, runIntegrationTests } from '@tupaia/database';
import { IndicatorApi } from '../../IndicatorApi';
import { Analytic, FetchOptions } from '../../types';
import arithmeticAnalyticsFixtures from './arithmeticAnalytics.fixtures.json';
import indicatorApiFixtures from './indicatorApi.fixtures.json';

interface TestCase {
  input: {
    indicatorCodes: string[];
    fetchOptions: FetchOptions;
  };
  expected: Analytic[] | string;
  throws?: boolean;
}

const models = getTestModels();
const dataBroker = new DataBroker();
const api = new IndicatorApi(models, dataBroker);

const runTestCase = (testCase: TestCase) => {
  const { input, expected, throws } = testCase;
  const { indicatorCodes, fetchOptions } = input;

  const expectedPromise = api.buildAnalytics(indicatorCodes, fetchOptions);
  if (throws) {
    return expect(expectedPromise).toBeRejectedWith(expected as string);
  }
  return expect(expectedPromise).resolves.toStrictEqual(expected);
};

describe('Integration tests', () => {
  afterAll(async () => {
    await dataBroker.close();
  });

  runIntegrationTests({
    config: indicatorApiFixtures,
    it: runTestCase,
  });

  runIntegrationTests({
    config: arithmeticAnalyticsFixtures,
    it: runTestCase,
  });
});
