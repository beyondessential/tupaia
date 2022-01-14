/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { getTestModels, setupTest, getTestDatabase, clearTestData } from '@tupaia/database';

import {
  arithmeticAnalyticFixtures,
  eventCheckConditionsFixtures,
  indicatorApiFixtures,
} from './fixtures';
import { DataBroker } from '../../../DataBroker';

describe('Indicator', () => {
  const models = getTestModels();
  const dataBroker = new DataBroker({});

  afterAll(async () => {
    const database = getTestDatabase();
    await clearTestData(database);
    await database.closeConnections();
  });

  const runTestCase = async testCase => {
    const { input, expected, throws } = testCase;
    const { indicatorCodes, fetchOptions } = input;

    const expectedPromise = dataBroker.pull(
      { code: indicatorCodes, type: 'dataElement' },
      fetchOptions,
    );
    if (throws) {
      return expect(expectedPromise).toBeRejectedWith(expected);
    }

    return expect(expectedPromise).resolves.toEqual(
      expect.objectContaining({
        results: [
          {
            analytics: expected,
            numAggregationsProcessed: 0,
          },
        ],
      }),
    );
  };

  describe('Indicator API features', () => {
    const { setup, testCases } = indicatorApiFixtures;

    beforeAll(async () => {
      await setupTest(models, setup);
    });

    testCases.forEach(testCase => {
      it(testCases[0].description, async () => {
        await runTestCase(testCases[0]);
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
