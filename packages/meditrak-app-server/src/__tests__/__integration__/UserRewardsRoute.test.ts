/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { constructAccessToken } from '@tupaia/auth';
import {
  buildAndInsertSurveyResponses,
  buildAndInsertSurveys,
  clearTestData,
  getTestDatabase,
  getTestModels,
} from '@tupaia/database';
import { TestableServer } from '@tupaia/server-boilerplate';
import { createBearerHeader } from '@tupaia/utils';
import { TestModelRegistry } from '../types';
import { setupTestApp, setupTestUser } from '../utilities';
import { CAT_QUESTION, CAT_SURVEY, CAT_USER_SESSION } from './fixtures';

describe('me/rewards', () => {
  const numberOfSurveyResponses = 200;

  let app: TestableServer;
  let authHeader: string;

  beforeAll(async () => {
    app = await setupTestApp();

    const user = await setupTestUser();
    authHeader = createBearerHeader(
      constructAccessToken({
        userId: user.id,
        refreshToken: CAT_USER_SESSION.refresh_token,
        apiClientUserId: undefined,
      }),
    );

    const models = getTestModels() as TestModelRegistry;
    await buildAndInsertSurveys(models, [CAT_SURVEY]);

    const catSurveyResponses = new Array(numberOfSurveyResponses).fill(0).map((_, index) => ({
      surveyCode: CAT_SURVEY.code,
      entityCode: 'CAT_LAND',
      user_id: user.id,
      answers: { [CAT_QUESTION.code]: index },
    }));

    await buildAndInsertSurveyResponses(models, catSurveyResponses);
  });

  afterAll(async () => {
    await clearTestData(getTestDatabase());
  });

  describe('/me/rewards (get user rewards)', () => {
    it('throws an error if no auth header is provided', async () => {
      const response = await app.get('me/rewards');

      expect(response.statusCode).toBe(500);
      expect(response.body.error).toMatch(/.*Authorization header required/);
    });

    it('returns 1 coconut per survey response, and one pig per 100 survey responses', async () => {
      const response = await app.get('me/rewards', {
        headers: {
          Authorization: authHeader,
        },
      });

      expect(response.body).toEqual({
        coconuts: numberOfSurveyResponses,
        pigs: numberOfSurveyResponses / 100,
      });
    });
  });
});
