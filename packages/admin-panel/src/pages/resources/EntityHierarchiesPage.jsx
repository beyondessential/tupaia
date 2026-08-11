import { groupBy } from 'es-toolkit/compat';
import React from 'react';

import { getSortByKey } from '@tupaia/utils';
import { get } from '../../VizBuilderApp/api';
import { TreeResourcePage } from './TreeResourcePage';
import { EntityHierarchyExportModal } from '../../importExport';
import { RESOURCE_NAME } from '../../routes/projects/entityHierarchy';

const fetchRoot = async () => get('hierarchies');

const fetchBranch = async (rootNode, node) => {
  const { code: hierarchyName } = rootNode;
  const { code: entityCode } = node;

  const descendants = await get(`hierarchy/${hierarchyName}/${entityCode}/descendants?`, {
    params: {
      fields: ['id', 'code', 'name', 'parent_code'].join(','),
      filter: 'generational_distance<=2',
    },
  });

  descendants.sort(getSortByKey('name'));
  const descendantsByParent = groupBy(descendants, 'parent_code');
  const children = descendantsByParent[entityCode] || [];

  return children.map(({ id, code, name }) => ({
    id,
    code,
    name,
    children: (descendantsByParent[code] || []).map(descendant => ({
      id: descendant.id,
    })),
  }));
};

export const EntityHierarchiesPage = props => (
  <TreeResourcePage
    resourceName={RESOURCE_NAME}
    fetchRoot={fetchRoot}
    fetchBranch={fetchBranch}
    ExportModalComponent={EntityHierarchyExportModal}
    {...props}
  />
);
