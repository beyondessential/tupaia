import { useQuery } from '@tanstack/react-query';
import { get } from '../../VizBuilderApp/api/api';

export const useItemDetails = (params, parent) => {
  return useQuery(
    ['itemDetails', parent?.endpoint, params],
    async () => {
      return await get(parent?.endpoint, {
        params: {
          filter: JSON.stringify(params),
          columns: JSON.stringify(
            parent?.columns?.filter(column => column.source).map(column => column.source),
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
