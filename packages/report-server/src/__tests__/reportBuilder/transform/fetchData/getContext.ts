/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { ReportServerAggregator } from '../../../../aggregator';
import { Context, ReqContext } from '../../../../reportBuilder/context';
import { FetchReportQuery } from '../../../../types';
import { entityApiMock } from '../../testUtils';
import {
  ENTITIES,
  fetchFakeAnalytics,
  fetchFakeEvents,
  HIERARCHY,
  RELATIONS,
} from './fetchData.fixtures';

export const getContext = (queryOverrides?: Partial<FetchReportQuery>) => {
  const entityApi = entityApiMock(ENTITIES, RELATIONS);

  const reqContext: ReqContext = {
    hierarchy: HIERARCHY,
    permissionGroup: 'Admin',
    services: {
      entity: entityApi,
    } as ReqContext['services'],
    accessPolicy: new AccessPolicy({
      PG: ['Admin'],
      TO: ['Admin'],
      WS: ['Admin'],
      explore: ['Admin'],
      MY: ['Public'],
    }),
    aggregator: ({
      fetchAnalytics: fetchFakeAnalytics,
      fetchEvents: fetchFakeEvents,
    } as unknown) as ReportServerAggregator,
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
