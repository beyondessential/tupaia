/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregation } from '../../../../types';
import { Row } from '../../../types';

type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year';

export type DateOffset = {
  unit: PeriodType;
  offset?: number;
  modifier?: 'start_of' | 'end_of';
  modifierUnit?: PeriodType;
  from?: string;
};

export type DateSpecs = string | DateOffset;

export type FetchConfig = {
  dataElements?: string[];
  dataGroups?: string[];
  aggregations?: Aggregation[];
  startDate?: string | DateSpecs;
  endDate?: string | DateSpecs;
  organisationUnits?: string | string[];
};

export type ParsedFetchConfig = {
  dataElements?: string[];
  dataGroups?: string[];
  aggregations?: Aggregation[];
  startDate?: DateSpecs;
  endDate?: DateSpecs;
  organisationUnits?: string[];
};

export interface FetchResponse {
  results: Row[];
  metadata?: {
    dataElementCodeToName?: Record<string, string>;
  };
}
