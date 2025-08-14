import { useQuery } from '@tanstack/react-query';
import { get } from '../../VizBuilderApp/api/api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../../VizBuilderApp/api/constants';

/**
 * @param {import('@tanstack/react-query').UseQueryOptions<ExternalDatabaseConnection[]>} useQueryOptions
 * @returns {import('@tanstack/react-query').UseQueryResult<ExternalDatabaseConnection[]>}
 */
export const useExternalDatabaseConnectionsQuery = useQueryOptions =>
  useQuery(
    ['externalDatabaseConnections'],
    async () =>
      await get('externalDatabaseConnections', {
        params: {
          columns: JSON.stringify(['code', 'name']),
        },
      }),
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
      keepPreviousData: true,
      ...useQueryOptions,
    },
  );
