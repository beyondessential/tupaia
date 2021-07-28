/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

// @see https://react-query.tanstack.com/overview
export const DEFAULT_REACT_QUERY_OPTIONS = {
  retry: 0,
  // should be refetched in the background every hour
  staleTime: 1000 * 60 * 60,
  refetchOnWindowFocus: false,
};
