/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from '@tanstack/react-query';
import { get } from '../../VizBuilderApp/api/api';

export const useItemDetails = (params, parent) => {
  return useQuery(
    ['itemDetails', parent?.endpoint, params],
    async () => {
      return get(parent?.endpoint, {
        params: {
          filter: JSON.stringify(params),
          columns: JSON.stringify(
            parent?.columns?.map(column => column.source).filter(source => source),
          ),
        },
      });
    },
    {
      enabled: !!params && !!parent?.endpoint,
      select: data => data?.[0] ?? null,
    },
  );
};
