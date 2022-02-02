/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { stringifyQuery } from '@tupaia/utils';
import { useQuery } from 'react-query';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const useSearchAggregationOptions = ({ search }) =>
  useQuery(
    ['aggregationOptions', search],
    async () => {
      const endpoint = stringifyQuery(undefined, 'fetchAggregationOptions', {});
      return get(endpoint);
    },
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
      keepPreviousData: true,
    },
  );
