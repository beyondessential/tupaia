/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

type Transform = string | Record<string, unknown>;

export type StandardReportConfig = {
  transform: Transform[];
  output?: Record<string, unknown>;
}

export type CustomReportConfig = {
  customReport: string;
};

export type ReportConfig = StandardReportConfig | CustomReportConfig;
