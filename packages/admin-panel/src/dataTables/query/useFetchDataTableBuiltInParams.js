import { useQuery } from '@tanstack/react-query';
import { get } from '../../VizBuilderApp/api/api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../../VizBuilderApp/api/constants';

export const useFetchDataTableBuiltInParams = dataTableType =>
  useQuery(
    ['fetchDataTableBuiltInParams', dataTableType],
    async () => {
      if (!dataTableType || dataTableType === 'sql') {
        return [];
      }

      const { parameters = [] } = await get(
        `fetchDataTableBuiltInParams?dataTableType=${dataTableType}`,
      );

      return parameters.map((p, index) => ({
        ...p,
        id: `builtIn_parameter_${index}`,
      }));
    },
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
      keepPreviousData: true,
    },
  );
