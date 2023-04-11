/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { stringifyQuery } from '@tupaia/utils';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const useEntities = search =>
  useQuery(
    ['entities'],
    async () => {
      const endpoint = stringifyQuery(undefined, `entities`, {
        columns: JSON.stringify(['name', 'code']),
        filter: JSON.stringify({
          name: { comparator: 'ilike', comparisonValue: `%${search}%`, castAs: 'text' },
        }),
      });
      return get(endpoint);
    },
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
    },
  );
