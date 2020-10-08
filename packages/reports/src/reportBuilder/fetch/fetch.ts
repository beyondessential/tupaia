import { FetchReportQuery } from '../../routes/fetchReport';
import { Aggregator } from '../../aggregator';
import { fetchFunctions, isValidFetchFunction } from './fetchFunctions';
import { Row } from '../reportBuilder';

export type Fetch = {
  [fetchFunctionName in keyof typeof fetchFunctions]?: object;
};

export interface FetchResponse {
  results: Row[];
}

export const fetch = (
  fetches: Fetch[],
  aggregator: Aggregator,
  query: FetchReportQuery,
): Promise<FetchResponse> => {
  const firstFetch: Fetch = fetches[0]; //Only support 1 fetch for now
  const fetchFunctionKey: string = Object.keys(firstFetch)[0];
  if (isValidFetchFunction(fetchFunctionKey)) {
    const fetchFunction = fetchFunctions[fetchFunctionKey];
    return fetchFunction(aggregator, query, firstFetch[fetchFunctionKey]);
  }
  throw new Error(`Expected fetch function but got ${fetchFunctionKey}`);
};
