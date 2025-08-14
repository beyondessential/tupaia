import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

export type FetchHierarchyEntitiesRequest = Request<
  { hierarchyName: string; entityCode: string },
  Record<string, unknown>[],
  Record<string, never>,
  { fields?: string; search?: string; pageSize?: string }
>;

export class FetchHierarchyEntitiesRoute extends Route<FetchHierarchyEntitiesRequest> {
  public async buildResponse() {
    const { entity: entityApi } = this.req.ctx.services;
    const { hierarchyName, entityCode } = this.req.params;
    const { fields, search, pageSize } = this.req.query;
    const queryParams: {
      fields?: string[];
      filter?: Record<string, { comparator: string; comparisonValue: unknown }>;
    } = {};
    if (fields) {
      queryParams.fields = fields.split(',');
    }
    if (search) {
      queryParams.filter = {
        name: {
          comparator: 'ilike',
          comparisonValue: search,
        },
      };
    }

    const projectEntity = await entityApi.getEntities(hierarchyName, [entityCode], queryParams);
    const descendants = await entityApi.getDescendantsOfEntity(
      hierarchyName,
      entityCode,
      queryParams,
      false,
      false,
    );
    const flattenedDescendants = projectEntity.concat(descendants);

    // If pageSize is provided, return only the first n entities
    if (pageSize) {
      return flattenedDescendants.slice(0, parseInt(pageSize, 10));
    }
    return flattenedDescendants;
  }
}
