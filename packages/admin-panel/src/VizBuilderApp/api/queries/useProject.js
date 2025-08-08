import { useQuery } from '@tanstack/react-query';

import { stringifyQuery } from '@tupaia/utils';

import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const useProject = (projectCode, onSuccess) =>
  useQuery(
    ['project', projectCode],
    async () => {
      const endpoint = stringifyQuery(undefined, 'projects', {
        columns: JSON.stringify(['project.code', 'entity.name']),
        filter: JSON.stringify({ 'project.code': projectCode }),
      });
      return get(endpoint);
    },
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
      enabled: !!projectCode,
      select: data => data?.[0],
      onSuccess,
    },
  );
