import { useQuery } from '@tanstack/react-query';
import { Project } from '@tupaia/types';
import { Entity } from '../../types';
import { get } from '../api';

export const useEntityAncestors = (projectCode?: Project['code'], entityCode?: Entity['code']) => {
  return useQuery<Entity[]>(
    ['entityAncestors', projectCode, entityCode],
    () => get(`entityAncestors/${projectCode}/${entityCode}`),
    {
      enabled: !!projectCode && !!entityCode,
    },
  );
};
