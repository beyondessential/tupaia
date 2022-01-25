export type Report = {
  id: string;
  code: string;
  config: ReportConfig;
  permission_group_id: string;
};

type ReportConfig = {
  fetch: FetchConfig;
  transform: any; // ...
};

type FetchConfig = {
  aggregations: Aggregation[];
  dataElements: any; // ...
  dataGroups: any; // ...
};

// This package does not know about Aggregator, so cannot import aggregationTypes. Therefore, we have to
// re-declare this enum. Package aggregator should import this in the future.
export enum AggregationType {
  COUNT_PER_ORG_GROUP = 'COUNT_PER_ORG_GROUP',
  COUNT_PER_PERIOD_PER_ORG_GROUP = 'COUNT_PER_PERIOD_PER_ORG_GROUP',
  FINAL_EACH_DAY_FILL_EMPTY_DAYS = 'FINAL_EACH_DAY_FILL_EMPTY_DAYS',
  FINAL_EACH_DAY = 'FINAL_EACH_DAY',
  // ...
}

type Aggregation = {
  type: AggregationType;
};
