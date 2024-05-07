/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

export interface TestResult {
  successes: number;
  skipped: string[];
  errors: string[];
  total: number;
}
