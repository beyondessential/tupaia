import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { SingleProject } from '../../types';
import { get } from '../api';

const queryFn = async () => {
  const projectsResponse = await get('projects', {
    params: { showExcludedProjects: false },
  });
  return projectsResponse?.projects.sort((a, b) => a.name.localeCompare(b.name));
};

export const useProjects = (
  useQueryOptions?: Omit<UseQueryOptions<SingleProject[]>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery(['projects'], queryFn, useQueryOptions);
};
