import { SingleBar } from 'cli-progress';
import { TupaiaApiClient } from '@tupaia/api-client';
import { Report } from '@tupaia/types';
import { TestResult } from './types';
import { ReportFetchQueue } from './ReportFetchQueue';

export const healthCheck = async (apiClient: TupaiaApiClient): Promise<TestResult> => {
  const reports = (await apiClient.central.fetchResources('reports', {
    pageSize: 'ALL',
  })) as Report[];

  const progressBar = new SingleBar({
    format: 'Health check | {bar} | {percentage}% || {value}/{total}',
    hideCursor: true,
  });

  const fetchQueue = new ReportFetchQueue(apiClient, reports, {
    onFetchReport: () => progressBar.increment(),
  });

  progressBar.start(reports.length, 0);
  const results = await fetchQueue.fetchAllReports();
  progressBar.stop();

  let successes = 0;
  const skipped: string[] = [];
  const errors: string[] = [];
  const total = reports.length;

  reports.forEach(({ code }) => {
    const result = results[code];

    const { error, skipped: reportWasSkipped } = result;

    if (error) {
      errors.push(`${code} - ${error}`);
      return;
    }

    if (reportWasSkipped) {
      skipped.push(code);
      return;
    }

    successes += 1;
  });

  return { successes, skipped, errors, total };
};
