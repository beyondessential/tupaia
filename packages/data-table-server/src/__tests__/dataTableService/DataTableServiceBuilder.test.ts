import { AccessPolicy } from '@tupaia/access-policy';
import { DataTable } from '@tupaia/types';
import { TupaiaApiClient } from '@tupaia/api-client';
import { DataTableRecord as DataTableRecordClass } from '@tupaia/database';
import { DataTableServiceBuilder, getDataTableServiceType } from '../../dataTableService';
import { AnalyticsDataTableService } from '../../dataTableService/services/AnalyticsDataTableService';

type DataTableRecord = DataTableRecordClass & DataTable;

describe('DataTableServiceBuilder', () => {
  describe('getDataTableServiceType', () => {
    describe('error cases', () => {
      it('throws an error for an unknown data-table type', () => {
        const dataTableWithUnknownType = new DataTableRecordClass(
          {},
          { type: 'unknown' },
        ) as DataTableRecord;

        const createUnknownTypeDataTableService = () =>
          getDataTableServiceType(dataTableWithUnknownType);

        expect(createUnknownTypeDataTableService).toThrow(
          'No data table service defined for: unknown',
        );
      });
    });

    it('can get the service type of a data-table', () => {
      const analyticsDataTable = new DataTableRecordClass(
        {},
        { type: 'analytics', code: 'analytics' },
      ) as DataTableRecord;

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
