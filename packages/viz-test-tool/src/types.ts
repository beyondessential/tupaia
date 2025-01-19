export interface TestResult {
  successes: number;
  skipped: string[];
  errors: string[];
  total: number;
}
