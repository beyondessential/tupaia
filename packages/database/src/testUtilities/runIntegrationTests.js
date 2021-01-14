/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { buildAndInsertSurveyResponses } from './buildAndInsertSurveyResponses';
import { buildAndInsertSurveys } from './buildAndInsertSurveys';
import { getTestModels } from './getTestDatabase';
import { findOrCreateRecords } from './upsertDummyRecord';
import { clearTestData } from './clearTestData';

const setupTest = async (models, setup) => {
  const { dbRecords = [], surveys = [], surveyResponses = [] } = setup;
  await findOrCreateRecords(models, dbRecords);
  await buildAndInsertSurveys(models, surveys);
  await buildAndInsertSurveyResponses(models, surveyResponses);
};

const tearDownTest = async models => {
  const { database } = models;
  await clearTestData(database);
  await database.closeConnections();
};

/**
 * @typedef {Object} IntegrationTestInput
 * @property {Object<string, *>} config
 * @property {Function} [beforeAll]
 * @property {Function} [afterAll]
 * @property {Function} it
 */

/**
 *
 * @param {IntegrationTestInput} input
 */
export const runIntegrationTests = ({
  config,
  beforeAll: beforeAllCallback,
  afterAll: afterAllCallback,
  it: testCaseCallback,
}) => {
  const { description, setup = {}, testCases } = config;

  describe(`(integration) ${description}`, () => {
    const models = getTestModels();

    beforeAll(async () => {
      await setupTest(models, setup);
      if (beforeAllCallback) {
        await beforeAllCallback();
      }
    });

    afterAll(async () => {
      await tearDownTest(models);
      if (afterAllCallback) {
        await afterAllCallback();
      }
    });

    testCases.forEach(testCase => {
      it(testCase.description, () => testCaseCallback(testCase));
    });
  });
};
