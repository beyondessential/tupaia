import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { debounce } from 'es-toolkit/compat';

import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

const useQueryResponse = (projectCode, search) =>
  useQuery(
    ['hierarchy', projectCode, search],
    () =>
      projectCode
        ? get(`hierarchy/${projectCode}/${projectCode}`, {
            // limit to 1000 locations for performance
            params: { search, fields: 'name,code', pageSize: 1000 },
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
