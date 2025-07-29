import { MultiBar } from 'cli-progress';
import { TupaiaApiClient } from '@tupaia/api-client';
import { Report } from '@tupaia/types';
import { isEqual } from 'es-toolkit/compat';
import { TestResult } from './types';
import { ReportFetchQueue } from './ReportFetchQueue';

/**
 * Pads out the instance names to have the same length as it looks nicer
 */
const instanceNamesForProgressBar = (baselineInstance: string, compareName: string) => [
  baselineInstance.padEnd(compareName.length),
  compareName.padEnd(baselineInstance.length),
];

export const compare = async (
  baselineInstance: string,
  compareInstance: string,
  baselineClient: TupaiaApiClient,
  compareClient: TupaiaApiClient,
): Promise<TestResult> => {
  const reports = (await baselineClient.central.fetchResources('reports', {
    pageSize: 'ALL',
  })) as Report[];

  const progressBar = new MultiBar({
    format: '{instance} | {bar} | {percentage}% || {value}/{total}',
    hideCursor: true,
  });

  const [baselineInstanceName, compareInstanceName] = instanceNamesForProgressBar(
    baselineInstance,
    compareInstance,
  );
  const baselineProgressBar = progressBar.create(reports.length, 0, {
    instance: baselineInstanceName,
  });
  const compareProgressBar = progressBar.create(reports.length, 0, {
    instance: compareInstanceName,
  });

  const baselineFetchQueue = new ReportFetchQueue(baselineClient, reports, {
    onFetchReport: () => baselineProgressBar.increment(),
  });
  const compareFetchQueue = new ReportFetchQueue(compareClient, reports, {
    onFetchReport: () => compareProgressBar.increment(),
  });

  const [baselineResults, compareResults] = await Promise.all([
    baselineFetchQueue.fetchAllReports(),
    compareFetchQueue.fetchAllReports(),
  ]);

  progressBar.stop();

  let successes = 0;
  const skipped: string[] = [];
  const errors: string[] = [];
  const total = reports.length;

  reports.forEach(({ code, latest_data_parameters: latestDataParameters }) => {
    const baselineResult = baselineResults[code];
    const compareResult = compareResults[code];

    if (baselineResult.error) {
      errors.push(`${baselineInstance}: ${code} - ${baselineResult.error}`);
      return;
    }

    if (compareResult.error) {
      errors.push(`${compareInstance}: ${code} - ${compareResult.error}`);
      return;
    }

    if (baselineResult.skipped) {
      skipped.push(code);
      return;
    }

    if (isEqual(baselineResult.data, compareResult.data)) {
      successes += 1;
    } else {
      errors.push(`${code} - data mismatch at: ${JSON.stringify(latestDataParameters)}`);
    }
  });

  return { successes, skipped, errors, total };
};
