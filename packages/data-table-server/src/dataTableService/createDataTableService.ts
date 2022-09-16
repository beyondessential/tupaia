/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TupaiaApiClient } from '@tupaia/api-client';
import { DataTableType } from '../models';
import { internalDataTableServices } from './internal';

/**
 * Factory function for building the correct DataTableService for the requested dataTable
 */
export const createDataTableService = (dataTable: DataTableType, apiClient: TupaiaApiClient) => {
  if (dataTable.type === 'internal') {
    const InternalDataTableServiceClass = internalDataTableServices[dataTable.code];
    if (!InternalDataTableServiceClass) {
      throw new Error(`No internal data-table defined for ${dataTable.code}`);
    }
    return new InternalDataTableServiceClass(apiClient, dataTable.config);
  }

  throw new Error(`Cannot build data table for type: ${dataTable.type}`);
};
