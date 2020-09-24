import { fetchFunctions } from './fetchFunctions';

export const fetch = (fetches: object[], aggregator, query: object[]) => {
  const firstFetch: object = fetches[0]; //Only support 1 fetch for now
  const fetchFunctionKey: string = Object.keys(firstFetch)[0];
  return fetchFunctions[fetchFunctionKey](aggregator, query, firstFetch[fetchFunctionKey]);
};
