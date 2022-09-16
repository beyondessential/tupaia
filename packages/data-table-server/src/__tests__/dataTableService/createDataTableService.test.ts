/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TupaiaApiClient } from '@tupaia/api-client';
import { DataTableType as DataTableTypeClass } from '@tupaia/database';
import { createDataTableService } from '../../dataTableService';
import { AnalyticsDataTableService } from '../../dataTableService/internal/AnalyticsDataTableService';
import { DataTableType } from '../../models';

describe('createDataTableService', () => {
  describe('error cases', () => {
    it('throws an error for an unknown data-table type', () => {
      const dataTableWithUnknownType = new DataTableTypeClass(
        {},
        { type: 'unknown' },
      ) as DataTableType;

      const createUnknownTypeDataTableService = () =>
        createDataTableService(dataTableWithUnknownType, {} as TupaiaApiClient);

      expect(createUnknownTypeDataTableService).toThrow(
        'Cannot build data table for type: unknown',
      );
    });

    it('throws an error for an unknown internal data-table', () => {
      const unknownInternalDataTable = new DataTableTypeClass(
        {},
        { type: 'internal', code: 'unknown' },
      ) as DataTableType;

      const createUnknownInternalDataTableService = () =>
        createDataTableService(unknownInternalDataTable, {} as TupaiaApiClient);

      expect(createUnknownInternalDataTableService).toThrow(
        'No internal data-table defined for unknown',
      );
    });
  });

  it('can create an internal data-table service', () => {
    const analyticsDataTable = new DataTableTypeClass(
      {},
      { type: 'internal', code: 'analytics' },
    ) as DataTableType;

    const analyticsDataTableService = createDataTableService(
      analyticsDataTable,
      {} as TupaiaApiClient,
    );

    expect(analyticsDataTableService instanceof AnalyticsDataTableService).toBe(true);
  });
});
