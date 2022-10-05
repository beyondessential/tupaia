/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { ReportServerAggregator } from '../../aggregator';
import { FetchReportQuery, RequestContext } from '../../types';
import { OutputContext } from '../output/types';

export type ReqContext = {
  query: FetchReportQuery;
  hierarchy: string;
  permissionGroup: string;
  services: RequestContext['services'];
  accessPolicy: AccessPolicy;
  aggregator: ReportServerAggregator;
};

type Dependencies = {
  orgUnits?: { code: string; name: string; id: string; attributes: Record<string, any> }[];
  facilityCountByOrgUnit?: Record<string, number>; // { TO: 14, PG: 9 }
  dataElementCodeToName?: Record<string, string>;
};
export type ContextDependency = keyof Dependencies;

export type Context = {
  request: ReqContext;
  dependencies: ContextDependency[];
  outputContext: OutputContext;
} & Dependencies;
