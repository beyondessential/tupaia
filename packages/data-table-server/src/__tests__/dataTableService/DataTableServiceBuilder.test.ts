/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaApiClient } from '@tupaia/api-client';
import { DataTableType as DataTableTypeClass } from '@tupaia/database';
import { DataTableServiceBuilder, getDataTableServiceType } from '../../dataTableService';
import { AnalyticsDataTableService } from '../../dataTableService/services/AnalyticsDataTableService';
import { DataTableType } from '../../models';

describe('DataTableServiceBuilder', () => {
  describe('getDataTableServiceType', () => {
    describe('error cases', () => {
      it('throws an error for an unknown data-table type', () => {
        const dataTableWithUnknownType = new DataTableTypeClass(
          {},
          { type: 'unknown' },
        ) as DataTableType;

        const createUnknownTypeDataTableService = () =>
          getDataTableServiceType(dataTableWithUnknownType);

        expect(createUnknownTypeDataTableService).toThrow(
          'No data table service defined for: unknown',
        );
      });
    });

    it('can get the service type of a data-table', () => {
      const analyticsDataTable = new DataTableTypeClass(
        {},
        { type: 'analytics', code: 'analytics' },
      ) as DataTableType;

      expect(getDataTableServiceType(analyticsDataTable)).toEqual('analytics');
    });
  });

  it('can build a data-table service', () => {
    const analyticsDataTableService = new DataTableServiceBuilder()
      .setServiceType('analytics')
      .setContext({
        accessPolicy: new AccessPolicy({ DL: ['Public'] }),
        apiClient: {} as TupaiaApiClient,
      })
      .build();

    expect(analyticsDataTableService instanceof AnalyticsDataTableService).toBe(true);
  });
});
