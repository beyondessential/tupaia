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
    ['entities', search],
    async () => {
      const endpoint = stringifyQuery(undefined, `entities`, {
        columns: JSON.stringify(['name', 'id']),
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

export const useEntity = entityId =>
  useQuery(
    ['entities', entityId],
    async () => {
      const endpoint = `entities/${entityId}`;
      return get(endpoint);
    },
    {
      enabled: !!entityId,
      ...DEFAULT_REACT_QUERY_OPTIONS,
    },
  );
