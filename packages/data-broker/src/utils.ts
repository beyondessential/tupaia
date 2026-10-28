import type { AnalyticResults } from './DataBroker/mergeAnalytics';

const DATA_ELEMENT = 'dataElement';
const DATA_GROUP = 'dataGroup';
export const DATA_SOURCE_TYPES = {
  DATA_ELEMENT,
  DATA_GROUP,
} as const;

export const EMPTY_ANALYTICS_RESULTS = {
  results: [],
  metadata: {
    dataElementCodeToName: {},
  },
} as const satisfies AnalyticResults;
