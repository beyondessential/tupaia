// @see https://react-query.tanstack.com/overview
export const DEFAULT_REACT_QUERY_OPTIONS = {
  retry: false,
  // should be refetched in the background every hour
  refetchOnWindowFocus: false,
  cacheTime: 0, // disable cache entirely because we always need to show live data
};
