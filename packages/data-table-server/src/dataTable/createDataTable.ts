/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TupaiaApiClient } from '@tupaia/api-client';
import { DataTableType } from '../models';
import { internalDataTables } from './internal';

/**
 * Factory function for building the correct data-table for the requested dataTableObject
 */
export const createDataTable = (dataTableObject: DataTableType, apiClient: TupaiaApiClient) => {
  if (dataTableObject.type === 'internal') {
    const InternalDataTableClass = internalDataTables[dataTableObject.code];
    if (!InternalDataTableClass) {
      throw new Error(`No internal data-table defined for ${dataTableObject.code}`);
    }
    return new InternalDataTableClass(apiClient, dataTableObject.config);
  }

  throw new Error(`Cannot build data table for type: ${dataTableObject.type}`);
};
