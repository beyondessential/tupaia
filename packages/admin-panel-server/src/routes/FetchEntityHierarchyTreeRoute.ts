/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { groupBy } from 'lodash';
import { getSortByKey } from '@tupaia/utils';

export type FetchEntityHierarchyTreeRequest = Request<
  Record<string, never> | { hierarchyName: string; entityCode: string },
  ({ id: string; code: string; name: string } & {
    children: { id: string }[];
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
      columns: ['parent_id', 'child_id'],
    });
    const childRelationsByParent = groupBy(childRelations, 'parent_id');

    return rootEntities.map(({ id, code, name }) => ({
      id,
      code,
      name,
      children: (childRelationsByParent[id] || []).map(childRelation => ({
        id: childRelation.child_id,
      })),
    }));
  }

  private async buildHierarchyEntityTree(hierarchyName: string, entityCode: string) {
    const { entity: entityApi } = this.req.ctx.services;

    const descendants = await entityApi.getDescendantsOfEntity(hierarchyName, entityCode, {
      filter: { generational_distance: { comparator: '<=', comparisonValue: 2 } },
      fields: ['id', 'code', 'name', 'parent_code'],
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
  }
}
