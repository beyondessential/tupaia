import { useQuery } from '@tanstack/react-query';

import { stringifyQuery } from '@tupaia/utils';

import { get } from '../../VizBuilderApp/api';

const PROJECT_LIST_COLUMNS = ['project.code', 'project.id', 'entity.name'];

export const useProjects = () =>
  useQuery(['projects', 'admin-panel-list'], async () => {
    const endpoint = stringifyQuery(undefined, 'projects', {
      columns: JSON.stringify(PROJECT_LIST_COLUMNS),
      pageSize: 'ALL',
      sort: JSON.stringify(['entity.name ASC']),
    });
    const projects = await get(endpoint);
    return Array.isArray(projects)
      ? projects.map(p => ({
          id: p['project.id'],
          code: p['project.code'],
          name: p['entity.name'],
        }))
      : [];
  });
