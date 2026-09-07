import { useQuery } from '@tanstack/react-query';
import { get } from '../../VizBuilderApp/api/api';
import { useSelectedProjectCode } from '../../projects';

export const useItemDetails = (params, parent) => {
  const projectCode = useSelectedProjectCode();
  // `projectCode` arrives here as a route-scope param on project-scoped pages
  // (e.g. /:projectCode/surveys/:id/edit). It's not a record column, so keep it
  // out of the server filter — otherwise the query becomes e.g.
  // `where survey.projectCode = ...` and fails ("column ... does not exist").
  const { projectCode: _scope, ...filter } = params ?? {};
  return useQuery(
    ['itemDetails', parent?.endpoint, filter, projectCode],
    async () => {
      return get(parent?.endpoint, {
        params: {
          filter: JSON.stringify(filter),
          columns: JSON.stringify(
            parent?.columns?.map(column => column.source).filter(source => source),
          ),
        },
      });
    },
    {
      enabled: !!params && !!parent?.endpoint,
      select: data => data?.[0] ?? null,
    },
  );
};
