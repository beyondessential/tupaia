/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { stringifyQuery } from '@tupaia/utils';
import { useQuery } from 'react-query';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const useSearchDataSources = ({ search, type = 'dataElement', maxResults = 100 }) => {
  const result = useQuery(
    [`${type}s`, search],
    async () => {
      const endpoint = stringifyQuery(undefined, `${type}s`, {
        columns: JSON.stringify(['code']),
        filter: JSON.stringify({
          code: { comparator: 'ilike', comparisonValue: `%${search}%`, castAs: 'text' },
        }),
        pageSize: maxResults,
      });
      return get(endpoint);
    },
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
      keepPreviousData: true,
    },
  );
  const mappedData = result?.data?.map(value => ({ ...value, type }));
  return {
    ...result,
    data: mappedData,
  };
};
