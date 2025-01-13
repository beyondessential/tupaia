import { TupaiaApiClient } from '@tupaia/api-client';
import { Report } from '@tupaia/types';

interface Options {
  parallelisation: number;
  onFetchReport: () => void;
}

/**
 * Introduced this queue to speed up tests by fetching reports in parallel.
 */
export class ReportFetchQueue {
  private readonly apiClient: TupaiaApiClient;
  private readonly reports: Report[];

  // ----- Options -----
  private readonly parallelisation: number;
  private readonly onFetchReport: () => void;
  // -------------------

  private readonly reportsBeingFetched = new Set<string>();
  private readonly results: Record<
    string,
    { data?: Record<string, unknown>[]; skipped?: boolean; error?: string }
  > = {};

  private nextReportIndex = 0;
  private runningPromiseResolve: (() => void) | null = null;

  public constructor(
    apiClient: TupaiaApiClient,
    reports: Report[],
    options: Partial<Options> = {},
  ) {
    this.apiClient = apiClient;
    this.reports = reports;
    this.parallelisation = options.parallelisation || 5;
    this.onFetchReport = options.onFetchReport || (() => {});
  }

  public async fetchAllReports() {
    const runningPromise = new Promise<void>(resolve => (this.runningPromiseResolve = resolve));

    // Start up multiple report fetchers, up to the parallesation factor
    for (let i = 0; i < this.reports.length && i < this.parallelisation; i++) {
      this.fetchNextReport();
    }

    await runningPromise; // This will resolve when all reports have been fetched

    return this.results;
  }

  /**
   * Recursively fetches reports until all have been fetched
   */
  private async fetchNextReport() {
    if (this.nextReportIndex >= this.reports.length) {
      if (this.reportsBeingFetched.size === 0) {
        // None more to fetch, and no more fetches in progress, we're done!
        this.done();
      }
      return;
    }

    const report = this.reports[this.nextReportIndex++];
    const { code, latest_data_parameters: latestDataParameters } = report;

    // Skip if parameters are empty
    if (Object.keys(latestDataParameters).length === 0) {
      this.results[code] = { skipped: true };
      this.onFetchReport();
      this.fetchNextReport();
      return;
    }

    try {
      this.reportsBeingFetched.add(code);
      const baseResult = await this.apiClient.report.fetchReport(code, latestDataParameters);
      this.results[code] = { data: baseResult };
    } catch (error) {
      this.results[code] = { error: (error as Error).message };
    } finally {
      this.reportsBeingFetched.delete(code);
      this.onFetchReport();
      this.fetchNextReport();
    }
  }

  private done() {
    if (!this.runningPromiseResolve) {
      throw new Error(`Cannot call done() before starting run`);
    }

    this.runningPromiseResolve();
  }
}
