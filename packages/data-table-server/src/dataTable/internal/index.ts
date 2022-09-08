/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TupaiaApiClient } from '@tupaia/api-client';
import { AbstractDataTable } from '../AbstractDataTable';
import { AnalyticsDataTable } from './AnalyticsDataTable';

export const internalDataTables: Record<
  string,
  new (apiClient: TupaiaApiClient, config: unknown) => AbstractDataTable
> = {
  analytics: AnalyticsDataTable,
};
