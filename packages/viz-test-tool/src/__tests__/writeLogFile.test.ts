import { LOGS_DIR, writeLogFile } from '../writeLogFile';

const mockFileSystem: Record<string, string> = {};

jest.mock('fs', () => ({
  writeFileSync: (filePath: string, fileContents: string) =>
    (mockFileSystem[filePath] = fileContents),
  existsSync: () => true,
}));

const date = new Date('2020-01-01');
jest.useFakeTimers().setSystemTime(date);

describe('writeLogFile', () => {
  it('writes the log file', () => {
    const results = {
      successes: 7,
      errors: ["bad_report - Oh no! Where's my tooth brush!?"],
      skipped: ['skipped_report'],
      total: 9,
    };

    writeLogFile(results);

    const logFileName = `${LOGS_DIR}/results_${date.getTime()}.log`;
    const logFile = mockFileSystem[logFileName];

    expect(logFile).toEqual(
      `successes: 7

errors:
  bad_report - Oh no! Where's my tooth brush!?

skipped:
  skipped_report

`,
    );
  });
});
