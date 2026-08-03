import type { UseQueryOptions } from '@tanstack/react-query';
import type { DatatrakWebProjectsRequest } from '@tupaia/types';
import { useOnlineQuery } from './useOnlineQuery';
import { get } from '../api';

type Projects = DatatrakWebProjectsRequest.ResBody;
type Project = Projects[number];

const useProjectsQuery = <TData = Projects>(
  useQueryOptions?: Omit<
    UseQueryOptions<Projects, unknown, TData>,
    'queryKey' | 'queryFn' | 'initialData'
  >,
) =>
  useOnlineQuery<Projects, unknown, TData>(
    ['projects'],
    async () => await get('projects'),
    useQueryOptions,
  );

const projectSort = (a: Project, b: Project) => {
  // Sort by hasAccess = true first
  if (a.hasAccess !== b.hasAccess) return a.hasAccess ? -1 : 1;
  // Sort by hasPendingAccess = true second
  if (a.hasPendingAccess !== b.hasPendingAccess) return a.hasPendingAccess ? -1 : 1;
  // Else, keep existing order (Array.prototype.sort is stable)
  return 0;
};

export const useProjects = (sortByAccess = true) =>
  useProjectsQuery({
    select: sortByAccess ? data => data.sort(projectSort) : undefined,
  });

const accessibleProjectsUseQueryOptions = {
  select: data => data.filter(project => project.hasAccess),
};

export const useAccessibleProjects = () => useProjectsQuery(accessibleProjectsUseQueryOptions);
