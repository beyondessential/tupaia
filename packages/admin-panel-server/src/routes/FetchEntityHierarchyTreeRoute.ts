/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { groupBy } from 'lodash';
import { getSortByKey } from '@tupaia/utils';

interface EntityNode {
  code: string;
  name: string;
  hierarchyName: string;
}

export type FetchEntityHierarchyTreeRequest = Request<
  Record<string, never> | { hierarchyName: string; entityCode: string },
  (EntityNode & {
    children: EntityNode[];
  })[],
  Record<string, never>,
  Record<string, never>
>;

export class FetchEntityHierarchyTreeRoute extends Route<FetchEntityHierarchyTreeRequest> {
  public async buildResponse() {
    const { hierarchyName, entityCode } = this.req.params;

    return hierarchyName && entityCode
      ? this.buildHierarchyEntityTree(hierarchyName, entityCode)
      : this.buildRootTree();
  }

  private async buildRootTree() {
    const { central: centralApi } = this.req.ctx.services;

    const rootEntities: Record<string, string>[] = await centralApi.fetchResources('entities', {
      filter: { type: 'project' },
      columns: ['id', 'code', 'name'],
      sort: ['name'],
    });

    const childRelations = await centralApi.fetchResources('entityRelations', {
      filter: { parent_id: rootEntities.map(({ id }) => id) },
      columns: ['parent_id', 'entity.code', 'entity.name'],
      sort: ['entity.name'],
    });
    const childRelationsByParent = groupBy(childRelations, 'parent_id');

    return rootEntities.map(({ id, code, name }) => ({
      code,
      name,
      hierarchyName: code,
      children: (childRelationsByParent[id] || []).map(child => ({
        code: child['entity.code'],
        name: child['entity.name'],
        hierarchyName: code,
      })),
    }));
  }

  private async buildHierarchyEntityTree(hierarchyName: string, entityCode: string) {
    const { entity: entityApi } = this.req.ctx.services;

    const descendants = await entityApi.getDescendantsOfEntity(hierarchyName, entityCode, {
      filter: { generational_distance: { comparator: '<=', comparisonValue: 2 } },
      fields: ['code', 'name', 'parent_code'],
    });

    descendants.sort(getSortByKey('name'));
    const descendantsByParent = groupBy(descendants, 'parent_code');
    const children = descendantsByParent[entityCode] || [];

    return children.map(({ code, name }) => ({
      code,
      name,
      hierarchyName,
      children: (descendantsByParent[code] || []).map(descendant => ({
        code: descendant.code,
        name: descendant.name,
        hierarchyName,
      })),
    }));
  }
}
