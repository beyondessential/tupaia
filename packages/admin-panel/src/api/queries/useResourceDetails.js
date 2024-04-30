/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../../VizBuilderApp/api/api';

export const useItemDetails = (id, parent) => {
  return useQuery(
    ['itemDetails', parent?.endpoint, id],
    async () => {
      return get(parent?.endpoint, {
        params: {
          filter: JSON.stringify({ id }),
          columns: JSON.stringify(
            parent?.columns?.map(column => column.source).filter(source => source),
          ),
        },
      });
    },
    {
      enabled: !!id && !!parent?.endpoint,
      select: data => data?.[0] ?? null,
    },
  );
};
