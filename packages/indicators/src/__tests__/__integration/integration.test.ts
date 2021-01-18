/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DataBroker } from '@tupaia/data-broker';
import { runIntegrationTests } from '@tupaia/database';
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

const dataBroker = new DataBroker();
// TODO Use the base `@tupaia/database` models instead of `dataBroker.models`
// after https://github.com/beyondessential/tupaia-backlog/issues/663 is implemented
const api = new IndicatorApi(dataBroker.models, dataBroker);

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
