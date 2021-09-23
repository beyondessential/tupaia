/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export type FieldValue = string | number | boolean | undefined | null;

export interface Row {
  [field: string]: FieldValue;
}

export interface PeriodMetadata {
  period?: {
    requested?: string;
    earliestAvailable?: string;
    latestAvailable?: string;
    reportStart?: string;
    reportEnd?: string;
  };
}
