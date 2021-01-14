/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DataBroker } from '@tupaia/data-broker';
import { runIntegrationTests } from '@tupaia/database';
import { IndicatorApi } from '../../IndicatorApi';
import { Analytic, FetchOptions } from '../../types';
import fixtures from './arithmeticAnalytics.fixtures.json';

interface TestCase {
  input: {
    indicatorCodes: string[];
    fetchOptions: FetchOptions;
  };
  expected: Analytic[];
}

const dataBroker = new DataBroker();
// TODO Use the base `@tupaia/database` models instead of `dataBroker.models`
// after https://github.com/beyondessential/tupaia-backlog/issues/663 is implemented
const api = new IndicatorApi(dataBroker.models, dataBroker);

runIntegrationTests({
  config: fixtures,
  afterAll: async () => {
    await dataBroker.close();
  },
  it: (testCase: TestCase) => {
    const { input, expected } = testCase;
    const { indicatorCodes, fetchOptions } = input;

    return expect(api.buildAnalytics(indicatorCodes, fetchOptions)).resolves.toStrictEqual(
      expected,
    );
  },
});
