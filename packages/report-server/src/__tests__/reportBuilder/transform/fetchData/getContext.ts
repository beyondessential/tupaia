import { AccessPolicy } from '@tupaia/access-policy';
import { MockDataTableApi, MockEntityApi, MockTupaiaApiClient } from '@tupaia/api-client';
import { RecursivePartial } from '@tupaia/types';
import { ReportServerAggregator } from '../../../../aggregator';
import { Context, ReqContext } from '../../../../reportBuilder/context';
import { FetchReportQuery } from '../../../../types';
import { eventsDataTable } from '../../../fixtures';
import { analyticsDataTable, ENTITIES, HIERARCHY, RELATIONS } from './fixtures';

export const getContext = (queryOverrides?: Partial<FetchReportQuery>) => {
  const reqContext: ReqContext = {
    hierarchy: HIERARCHY,
    permissionGroup: 'Admin',
    services: new MockTupaiaApiClient({
      entity: new MockEntityApi(ENTITIES, RELATIONS),
      dataTable: new MockDataTableApi({ analytics: analyticsDataTable, events: eventsDataTable }),
    }),
    accessPolicy: new AccessPolicy({
      PG: ['Admin'],
      TO: ['Admin'],
      WS: ['Admin'],
      explore: ['Admin'],
      MY: ['Public'],
    }),
    aggregator: {} as unknown as ReportServerAggregator,
    query: {
      hierarchy: HIERARCHY,
      organisationUnitCodes: [],
      ...queryOverrides,
    },
  };

  const context: RecursivePartial<Context> = {
    request: reqContext,
    dependencies: [],
  };

  return context;
};
