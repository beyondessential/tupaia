import { Knex } from 'knex';

import { TupaiaApiClient } from '@tupaia/api-client';
import { DashboardItemModel, ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import { ReportModel } from '@tupaia/server-boilerplate';

export type RequestContext = {
  services: TupaiaApiClient;
};

export interface ReportServerModelRegistry extends ModelRegistry {
  readonly database: TupaiaDatabase;

  readonly dashboardItem: DashboardItemModel;
  readonly report: ReportModel;

  wrapInTransaction<T = unknown>(
    wrappedFunction: (models: ReportServerModelRegistry) => Promise<T>,
    transactionConfig?: Knex.TransactionConfig,
  ): Promise<T>;
  wrapInReadOnlyTransaction<T = unknown>(
    wrappedFunction: (models: ReportServerModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'readOnly'>,
  ): Promise<T>;
  wrapInRepeatableReadTransaction<T = unknown>(
    wrappedFunction: (models: ReportServerModelRegistry) => Promise<T>,
    transactionConfig?: Omit<Knex.TransactionConfig, 'isolation'>,
  ): Promise<T>;
}

export type PeriodParams = {
  period?: string;
  startDate?: string;
  endDate?: string;
};

export type FetchReportQuery = PeriodParams & {
  organisationUnitCodes: string[];
  hierarchy: string;
};

export type AggregationObject = {
  type: string;
  config?: Record<string, unknown>;
};

export type Aggregation = string | AggregationObject;

export interface Event {
  event: string;
  eventDate: string;
  orgUnitName: string;
  orgUnit: string;
  dataValues?: Record<string, string | number>;
}

export interface EventMetaData {
  code: string;
  name: string;
  dataElements: { code: string; name: string; text: string }[];
}

export interface AggregationType {
  code: string;
  description: string;
}

export interface TransformSchema {
  code: string;
  alias?: boolean;
  string?: Record<string, string | boolean | string[]> | null;
}
