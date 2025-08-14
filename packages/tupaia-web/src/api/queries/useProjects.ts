import { useQuery } from '@tanstack/react-query';
import { get } from '../api';

export const useProjects = () => {
  return useQuery(['projects'], async () => {
    const projectsResponse = await get('projects', {
      params: {
        showExcludedProjects: false,
      },
    });
    return projectsResponse?.projects.sort((a, b) => a.name.localeCompare(b.name));
  });
};
