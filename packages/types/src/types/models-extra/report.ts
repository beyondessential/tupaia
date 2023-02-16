/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

type Transform = string | Record<string, unknown>;

export type ReportConfig = {
  transform: Transform[];
  output?: Record<string, unknown>;
};
