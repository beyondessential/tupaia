import { useQuery } from '@tanstack/react-query';
import { DatatrakWebProjectsRequest } from '@tupaia/types';
import { get } from '../api';

export const useProjects = (sortByAccess = true) => {
  const useQueryResult = useQuery<DatatrakWebProjectsRequest.ResBody>(['projects'], () =>
    get('projects'),
  );

  // Short-circuit if still fetching data
  if (!useQueryResult.data) return useQueryResult;

  const { data, ...query } = useQueryResult;
  if (sortByAccess) {
    data.sort((a, b) => {
      // Sort by hasAccess = true first
      if (a.hasAccess !== b.hasAccess) {
        return a.hasAccess ? -1 : 1;
      }

      // Sort by hasPendingAccess = true second
      if (a.hasPendingAccess !== b.hasPendingAccess) {
        return a.hasPendingAccess ? -1 : 1;
      }

      // Otherwise, sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  }

  return { ...query, data };
};
