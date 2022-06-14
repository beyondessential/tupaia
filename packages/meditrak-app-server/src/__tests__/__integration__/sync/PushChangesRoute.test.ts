/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { constructAccessToken } from '@tupaia/auth';
import { TestableServer } from '@tupaia/server-boilerplate';
import { createBearerHeader } from '@tupaia/utils';
import { setupTestApp, setupTestUser } from '../../utilities';
import { CAT_USER_SESSION } from '../fixtures';

const mockResponseMsg = (numberOfChanges: number) =>
  `Successfully pushed ${numberOfChanges} changes`;

describe('changes (POST)', () => {
  let app: TestableServer;
  let authHeader: string;

  beforeAll(async () => {
    app = await setupTestApp({
      central: {
        async meditrak_only_pushChanges(changes: unknown[]) {
          return { message: mockResponseMsg(changes.length) };
        },
      },
    });

    const user = await setupTestUser();
    authHeader = createBearerHeader(
      constructAccessToken({
        userId: user.id,
        refreshToken: CAT_USER_SESSION.refresh_token,
        apiClientUserId: undefined,
      }),
    );
  });

  it('throws an error if no auth header provided', async () => {
    const response = await app.post('changes');
    expect(response.statusCode).toEqual(500);
    expect(response.body.error).toMatch(/.*Authorization header required/);
  });

  it('it invokes meditrak_only_pushChanges() on the CentralApi', async () => {
    const changes = [
      {
        action: 'SubmitSurveyResponse',
        payload: {
          id: '1234',
          assessor_name: 'Tim',
          entity_id: '5678',
          start_time: '2010-01-01',
          end_time: '2010-01-02',
          survey_id: 'qwer',
          user_id: 'tyui',
          answers: [],
        },
      },
    ];

    const response = await app.post('changes', {
      headers: {
        Authorization: authHeader,
      },
      body: changes,
    });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ message: mockResponseMsg(changes.length) });
  });
});
