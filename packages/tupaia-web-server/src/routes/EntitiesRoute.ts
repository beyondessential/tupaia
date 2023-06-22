/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { Entity } from '@tupaia/types';
import groupBy from 'lodash.groupby';

export type EntitiesRequest = Request<any, any, any, any>;

interface NestedEntity extends Entity {
  parent_code?: string | null;
  children?: NestedEntity[] | null;
}

const DEFAULT_FILTER = {
  generational_distance: {
    comparator: '<=',
    comparisonValue: 2,
  },
};
const DEFAULT_FIELDS = ['parent_code', 'code', 'name', 'type'];

export class EntitiesRoute extends Route<EntitiesRequest> {
  public async buildResponse() {
    const { params, query, ctx } = this.req;
    const { rootEntityCode, hierarchyName } = params;
    const { filter, ...restOfQuery } = query;

    // Apply the generational_distance filter even if the user specifies other filters
    // Only override it if the user specifically requests to override
    const flatEntities = await ctx.services.entity.getDescendantsOfEntity(
      hierarchyName,
      rootEntityCode,
      { filter: { ...DEFAULT_FILTER, ...filter }, fields: DEFAULT_FIELDS, ...restOfQuery },
      true,
    );

    // Entity server returns a flat list of entities
    // Convert that to a nested object
    const nestChildrenEntities = (
      entitiesByParent: Record<string, NestedEntity[]>,
      parentEntity: NestedEntity,
    ): NestedEntity => {
      const children = entitiesByParent[parentEntity.code] || [];
      const nestedChildren = children.map((childEntity: NestedEntity) =>
        nestChildrenEntities(entitiesByParent, childEntity),
      );
      return { ...parentEntity, children: nestedChildren };
    };

    const entitiesByParent = groupBy(flatEntities, (e: NestedEntity) => e.parent_code);
    const rootEntity = flatEntities.find((entity: NestedEntity) => entity.code === rootEntityCode);
    const nestedEntities = nestChildrenEntities(entitiesByParent, rootEntity);

    return nestedEntities;
  }
}
