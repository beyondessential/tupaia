import { MockCentralApi, MockReportApi, MockTupaiaApiClient } from '@tupaia/api-client';
import { compare } from '../compare';

const SAME_REPORT = {
  parameters: { animal: 'cat' },
  results: [{ number_of_animals: 5 }],
};

const SKIPPED_REPORT = {
  parameters: {},
  results: [{ number_of_animals: 6 }],
};

const ERROR_REPORT = {
  parameters: { animal: 'donkey' },
  results: [],
  error: 'Data source is broken',
};

const BASE_DIFFERENT_REPORT = {
  parameters: { animal: 'dog' },
  results: [{ number_of_animals: 3 }],
};

const OTHER_DIFFERENT_REPORT = {
  parameters: { animal: 'dog' },
  results: [{ number_of_animals: 4 }],
};

// Mock out progress bar
jest.mock('cli-progress', () => ({
  MultiBar: class {
    public start() {}
    public stop() {}
    public create() {
      return { increment: () => {} };
    }
  },
}));

describe('compare', () => {
  const baseClient = new MockTupaiaApiClient({
    central: new MockCentralApi({
      reports: [
        { code: 'same', latest_data_parameters: SAME_REPORT.parameters },
        { code: 'different', latest_data_parameters: BASE_DIFFERENT_REPORT.parameters },
        { code: 'skipped', latest_data_parameters: SKIPPED_REPORT.parameters },
        { code: 'error', latest_data_parameters: ERROR_REPORT.parameters },
      ],
    }),
    report: new MockReportApi({
      same: SAME_REPORT,
      different: BASE_DIFFERENT_REPORT,
      skipped: SKIPPED_REPORT,
      error: ERROR_REPORT,
    }),
  });

  const otherClient = new MockTupaiaApiClient({
    report: new MockReportApi({
      same: SAME_REPORT,
      different: OTHER_DIFFERENT_REPORT,
      skipped: SKIPPED_REPORT,
      error: ERROR_REPORT,
    }),
  });

  it('can compare data between two instances', async () => {
    const comparison = await compare('testA', 'testB', baseClient, otherClient);
    expect(comparison).toEqual({
      successes: 1,
      errors: [
        'different - data mismatch at: {"animal":"dog"}',
        'testA: error - Data source is broken',
      ],
      skipped: ['skipped'],
      total: 4,
    });
  });
});
