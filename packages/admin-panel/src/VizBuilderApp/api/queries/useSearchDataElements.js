/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { stringifyQuery } from '@tupaia/utils';
import { useQuery } from 'react-query';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const useSearchDataElements = ({ search, maxResults = 100 }) =>
  useQuery(
    ['dataElements', search],
    async () => {
      const endpoint = stringifyQuery(undefined, 'dataElements', {
        columns: JSON.stringify(['code']),
        filter: JSON.stringify({
          code: { comparator: 'ilike', comparisonValue: `${search}%`, castAs: 'text' },
        }),
        pageSize: maxResults,
      });
      const response = await get(endpoint);
      return response.map(item => ({ ...item, type: 'dataElement' }));
    },
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
      keepPreviousData: true,
    },
  );
