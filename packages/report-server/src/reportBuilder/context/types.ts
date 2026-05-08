import { AccessPolicy } from '@tupaia/access-policy';
import { ReportServerAggregator } from '../../aggregator';
import { FetchReportQuery, RequestContext } from '../../types';
import { Row } from '../types';

export interface ReqContext {
  query: FetchReportQuery;
  hierarchy: string;
  permissionGroup: string;
  services: RequestContext['services'];
  accessPolicy: AccessPolicy;
  aggregator: ReportServerAggregator;
}

interface Dependencies {
  orgUnits?: {
    attributes: Record<string, unknown>;
    code: string;
    id: string;
    name: string;
  }[];
}
export type ContextDependency = keyof Dependencies;

export type Context = {
  request: ReqContext;
  dependencies: ContextDependency[];
} & Dependencies;

export interface FetchResponse {
  results: Row[];
}
