import { fetchFunctions } from './fetchFunctions';

export const fetch = (fetches, aggregator, query) => {
  const firstFetch = fetches[0]; //Only support 1 fetch for now
  const fetchFunctionKey = Object.keys(firstFetch)[0];
  return fetchFunctions[fetchFunctionKey](aggregator, query, firstFetch[fetchFunctionKey]);
};
