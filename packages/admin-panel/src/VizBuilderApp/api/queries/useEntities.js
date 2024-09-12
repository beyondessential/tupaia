/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from '@tanstack/react-query';
import { stringifyQuery } from '@tupaia/utils';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const useEntities = search =>
  useQuery(
    ['entities', search],
    async () => {
      const endpoint = stringifyQuery(undefined, `entities`, {
        columns: JSON.stringify(['name', 'code', 'id', 'country_code']),
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

export const useEntityByCode = (entityCode, onSuccess) =>
  useQuery(
    ['entities', entityCode],
    () =>
      get('entities', {
        params: {
          filter: JSON.stringify({
            code: entityCode,
          }),
        },
      }),
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
      enabled: !!entityCode,
      select: data => data?.[0],
      onSuccess,
    },
  );
