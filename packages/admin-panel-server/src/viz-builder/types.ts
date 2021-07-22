/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

type AggregationObject = {
  readonly type: string;
  readonly config?: Record<string, unknown>;
}

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

export type DashboardVisualisationObject = {
  code: string;
  name: string;
  permissionGroup: string;
  data: DataObject;
  presentation: PresentationObject;
};
