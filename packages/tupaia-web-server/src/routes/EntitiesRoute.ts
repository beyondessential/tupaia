/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { Entity } from '@tupaia/types';

export type EntitiesRequest = Request<
  any,
  any,
  any,
  any
>;

interface NestedEntity extends Entity {
  parent_code?: string | null;
  children?: NestedEntity[] | null;
}

export class EntitiesRoute extends Route<EntitiesRequest> {
  public async buildResponse() {
    const { params, query, ctx } = this.req;
    const { rootEntityCode, hierarchyName } = params;

    // TODO: Allow filtering by generational distance in entity server
    const flatEntities = await ctx.services.entity.getDescendantsOfEntity(hierarchyName, rootEntityCode, {}, true);

    // Entity server returns a flat list of entities
    // Convert that to a nested object
    const nestChildrenEntities = (allEntities: NestedEntity[], parentEntity: NestedEntity) => {
      parentEntity.children = allEntities.filter((entity: NestedEntity) => entity.parent_code === parentEntity.code);
      parentEntity.children.forEach((childEntity: NestedEntity) => {
        nestChildrenEntities(allEntities, childEntity);
      });
      return parentEntity;
    };

    const rootEntity = flatEntities.find((entity: NestedEntity) => entity.code === rootEntityCode);
    const nestedEntities = nestChildrenEntities(flatEntities, rootEntity);
    
    return nestedEntities;
  }
}
