/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { buildAndInsertSurveyResponses } from './buildAndInsertSurveyResponses';
import { buildAndInsertSurveys } from './buildAndInsertSurveys';
import { getTestModels } from './getTestDatabase';
import { findOrCreateRecords } from './upsertDummyRecord';

const setupTest = async (models, setup) => {
  const { dbRecords = [], surveys = [], surveyResponses = [] } = setup;
  await findOrCreateRecords(models, dbRecords);
  await buildAndInsertSurveys(models, surveys);
  await buildAndInsertSurveyResponses(models, surveyResponses);
};

/**
 * @typedef {Object} IntegrationTestInput
 * @property {Object<string, *>} config
 * @property {Function} [beforeAll]
 * @property {Function} [afterAll]
 * @property {Function} it
 */

/**
 * @param {IntegrationTestInput} input
 */
export const runIntegrationTests = ({
  config,
  beforeAll: beforeAllCallback,
  afterAll: afterAllCallback,
  it: testCaseCallback,
}) => {
  const { description, setup = {}, testCases } = config;

  describe(description, () => {
    const models = getTestModels();

    beforeAll(async () => {
      await setupTest(models, setup);
      if (beforeAllCallback) {
        await beforeAllCallback();
      }
    });

    afterAll(async () => {
      if (afterAllCallback) {
        await afterAllCallback();
      }
    });

    testCases.forEach(testCase => {
      it(testCase.description, () => testCaseCallback(testCase));
    });
  });
};
