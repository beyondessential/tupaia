import { MockCentralApi, MockReportApi, MockTupaiaApiClient } from '@tupaia/api-client';
import { healthCheck } from '../healthCheck';

const HEALTHY_REPORT = {
  parameters: { animal: 'cat' },
  results: [{ number_of_animals: 5 }],
};

const SKIPPED_REPORT = {
  parameters: {},
  results: [{ number_of_animals: 6 }],
};

const UNHEALTHY_REPORT = {
  parameters: { animal: 'donkey' },
  results: [],
  error: 'Data source is broken',
};

// Mock out progress bar
jest.mock('cli-progress', () => ({
  SingleBar: class {
    public start() {}
    public stop() {}
    public increment() {}
  },
}));

describe('healthCheck', () => {
  const apiClient = new MockTupaiaApiClient({
    central: new MockCentralApi({
      reports: [
        { code: 'healthy', latest_data_parameters: HEALTHY_REPORT.parameters },
        { code: 'skipped', latest_data_parameters: SKIPPED_REPORT.parameters },
        { code: 'unhealthy', latest_data_parameters: UNHEALTHY_REPORT.parameters },
      ],
    }),
    report: new MockReportApi({
      healthy: HEALTHY_REPORT,
      skipped: SKIPPED_REPORT,
      unhealthy: UNHEALTHY_REPORT,
    }),
  });

  it('can check which reports are health on the current instance', async () => {
    const comparison = await healthCheck(apiClient);
    expect(comparison).toEqual({
      successes: 1,
      errors: ['unhealthy - Data source is broken'],
      skipped: ['skipped'],
      total: 3,
    });
  });
});
