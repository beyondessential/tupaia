/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { TestableServer } from '@tupaia/server-boilerplate';
import { setupTestApp } from './testUtils';
import { REPORT } from './testUtils/integration.fixtures';
import { models } from './testUtils/setup';

describe('FetchReport', () => {
  let app: TestableServer;

  beforeAll(async () => {
    app = await setupTestApp();
  });

  it('Should query the report and return the results', async () => {
    const response = await app.get(
      `fetchReport/${REPORT.code}?organisationUnitCodes=TO&hierarchy=explore`,
    );
    const report = response.body;
    expect(report.results).toEqual([
      {
        orgUnit: 'TO',
        eventDate: '2020-01-01',
        orgUnitName: 'Tonga',
      },
    ]);
  });
});
