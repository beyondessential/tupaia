import type { AnalyticResults } from './DataBroker/mergeAnalytics';

const DATA_ELEMENT = 'dataElement';
const DATA_GROUP = 'dataGroup';
const SYNC_GROUP = 'syncGroup';
export const DATA_SOURCE_TYPES = {
  DATA_ELEMENT,
  DATA_GROUP,
  SYNC_GROUP,
} as const;

export const EMPTY_ANALYTICS_RESULTS = {
  results: [],
  metadata: {
    dataElementCodeToName: {},
  },
} as const satisfies AnalyticResults;
