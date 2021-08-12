/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

type AggregationObject = {
  readonly type: string;
  readonly config?: Record<string, unknown>;
};

type Aggregation = string | AggregationObject;

type Transform = Record<string, unknown>;

type DataObject = {
  dataElements: string[];
  dataGroups: string[];
  aggregations: Aggregation[];
  transform: Transform[];
};

type PresentationObject = {
  readonly type: 'view' | 'chart' | 'matrix';
  readonly config: Record<string, unknown>;
  readonly output: Record<string, unknown>;
};

export enum PreviewMode {
  DATA = 'data',
  PRESENTATION = 'presentation',
}

export type DashboardVisualisationObject = {
  id?: string;
  code: string;
  name: string;
  permissionGroup: string;
  data: DataObject;
  presentation: PresentationObject;
};

export interface VisualisationValidator {
  validationSchema: yup.ObjectSchema;
  validate: (object: DashboardVisualisationObject) => void;
}

export type DashboardItem = {
  id?: string;
  code: string;
  config: Record<string, unknown>;
  reportCode: string;
  legacy: boolean;
};

type FetchConfig = {
  dataElements: string[];
  dataGroups: string[];
  aggregations: Aggregation[];
};

type ReportConfig = {
  fetch: FetchConfig;
  transform: Transform[];
  output: Record<string, unknown>;
};

export type Report = {
  code: string;
  permissionGroup: string;
  config: ReportConfig;
};
