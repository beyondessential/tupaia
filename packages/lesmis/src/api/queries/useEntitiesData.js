import { useQuery } from '@tanstack/react-query';
import { keyBy } from 'es-toolkit/compat';
import { get } from '../api';
import { PROJECT_CODE } from '../../constants';

const DEFAULT_PARAMS = { includeRootEntity: true };

export const useEntitiesData = (entityCode, params = DEFAULT_PARAMS) => {
  const query = useQuery(
    ['entities', entityCode, params],
    () => get(`entities/${entityCode}`, { params }),
    {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const entitiesByCode = keyBy(query.data, 'code');
  return { ...query, entitiesByCode };
};

const PROJECT_PARAMS = {
  fields: [
    'id',
    'child_codes',
    'code',
    'country_code',
    'image_url',
    'name',
    'type',
    'parent_code',
    'attributes',
  ],
};

export const useProjectEntitiesData = () => {
  const query = useQuery(
    ['entities'],
    () => get(`entities/${PROJECT_CODE}`, { params: PROJECT_PARAMS }),
    {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const entitiesByCode = keyBy(query.data, 'code');
  return { ...query, entitiesByCode };
};
