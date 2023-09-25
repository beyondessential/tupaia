/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { TestableServer } from '@tupaia/server-boilerplate';
import { setupTestApp } from '../utilities';

const UNSUPPORTED_APP_VERSION = '1.7.106';

describe('appVersion', () => {
  let app: TestableServer;

  beforeAll(async () => {
    app = await setupTestApp();
    app.removeDefaultQueryParam('appVersion');
  });

  it('returns an error if appVersion is not provided', async () => {
    const response = await app.get('test');

    expect(response.statusCode).toEqual(500);
    expect(response.body.error).toMatch(/appVersion unspecified, please upgrade your app/);
  });

  it('returns an error if appVersion is not supported', async () => {
    const response = await app.get('test', {
      query: {
        appVersion: UNSUPPORTED_APP_VERSION,
      },
    });

    expect(response.statusCode).toEqual(500);
    expect(response.body.error).toMatch(
      /appVersion 1.7.106 is no longer supported. Please upgrade your Meditrak App from the Play Store/,
    );
  });
});
