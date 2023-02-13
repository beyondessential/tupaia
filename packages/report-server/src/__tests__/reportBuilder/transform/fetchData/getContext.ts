/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { MockTupaiaApiClient, MockDataTableApi, MockEntityApi } from '@tupaia/api-client';
import { ReportServerAggregator } from '../../../../aggregator';
import { Context, ReqContext } from '../../../../reportBuilder/context';
import { FetchReportQuery } from '../../../../types';
import {
  analyticsDataTable,
  ENTITIES,
  eventsDataTable,
  HIERARCHY,
  RELATIONS,
} from './fetchData.fixtures';

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
    aggregator: ({} as unknown) as ReportServerAggregator,
    query: {
      hierarchy: HIERARCHY,
      organisationUnitCodes: [],
      ...queryOverrides,
    },
  };

  const context: Context = {
    request: reqContext,
    dependencies: [],
    outputContext: {},
  };

  return context;
};
