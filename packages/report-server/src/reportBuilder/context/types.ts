/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { ReportServerAggregator } from '../../aggregator';
import { FetchReportQuery, RequestContext } from '../../types';
import { OutputContext } from '../output/types';
import { Row } from '../types';

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
};
export type ContextDependency = keyof Dependencies;

export type Context = {
  request: ReqContext;
  dependencies: ContextDependency[];
  outputContext: OutputContext;
} & Dependencies;

export interface FetchResponse {
  results: Row[];
}
