/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import debounce from 'lodash.debounce';

import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

const useQueryResponse = (projectCode, search) =>
  useQuery(
    ['hierarchy', projectCode, search],
    () =>
      projectCode
        ? get(`hierarchy/${projectCode}/${projectCode}`, {
            params: { search, fields: 'name,code' },
          })
        : [],
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
      enabled: false, // disable this query from automatically running, used for debounce
    },
  );

export const useLocations = (projectCode, search) => {
  const queryResponse = useQueryResponse(projectCode, search);
  const { refetch } = queryResponse;
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      refetch();
    }, 100);
    debouncedSearch();
    return debouncedSearch.cancel;
  }, [projectCode, search]);

  return queryResponse;
};
