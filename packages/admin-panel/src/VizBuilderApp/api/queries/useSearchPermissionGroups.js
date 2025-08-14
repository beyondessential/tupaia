import { stringifyQuery } from '@tupaia/utils';
import { useQuery } from '@tanstack/react-query';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const useSearchPermissionGroups = ({ search }) => {
  const result = useQuery(
    [`permissionGroups`, search],
    async () => {
      const endpoint = stringifyQuery(undefined, `permissionGroups`, {
        columns: JSON.stringify(['name']),
        filter: JSON.stringify({
          name: { comparator: 'ilike', comparisonValue: `%${search}%`, castAs: 'text' },
        }),
      });
      return get(endpoint);
    },
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
      keepPreviousData: true,
    },
  );

  return {
    ...result,
    data: result?.data,
  };
};
