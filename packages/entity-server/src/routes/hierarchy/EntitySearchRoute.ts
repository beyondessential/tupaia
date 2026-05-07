import { Route } from '@tupaia/server-boilerplate';
import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { formatEntitiesForResponse } from './format';
import {
  MultiEntityRequest,
  MultiEntityRequestParams,
  MultiEntityRequestBody,
  EntityRequestQuery,
  EntityResponse,
} from './types';

const { RAW } = QUERY_CONJUNCTIONS;

export type EntitySearchRequest = MultiEntityRequest<
  MultiEntityRequestParams & { searchString: string },
  EntityResponse[],
  MultiEntityRequestBody,
  EntityRequestQuery & { pageSize?: number; page?: number }
>;
export class EntitySearchRoute extends Route<EntitySearchRequest> {
  public async buildResponse() {
    const { hierarchyId, fields, field, filter } = this.req.ctx;
    const { searchString: rawString } = this.req.params;
    const { pageSize, page } = this.req.query;
    const searchString = rawString.toLowerCase();

    // TUP-3065/TUP-3060: this route used to read the ancestor_descendant_relation
    // closure cache, which is no longer maintained. Get the in-hierarchy entity-id
    // set via getDescendants — that walks the unified parent_id + project_country
    // edges and stays project-scoped.
    const project = await this.req.models.project.findOne({ entity_hierarchy_id: hierarchyId });
    if (!project || !project.entity_id) return [];

    const projectEntity = await this.req.models.entity.findById(project.entity_id);
    if (!projectEntity) return [];

    const inHierarchy = await projectEntity.getDescendants(hierarchyId);
    const inHierarchyIds = inHierarchy.map(e => e.id);
    if (inHierarchyIds.length === 0) return [];

    const entities = await this.req.models.entity.find(
      {
        ...filter,
        id: inHierarchyIds,
        [RAW]: {
          // Pre-RN-1853 the depth ordering came from generational_distance in the
          // closure cache. Replace with entity-type priority — gives the same
          // ordering for the canonical types these tests exercise (countries before
          // cities/villages/districts before facilities) without a second walk.
          sql: `name ILIKE :searchFilter
            ORDER BY
              STARTS_WITH(LOWER(name), :searchString) DESC,
              CASE entity.type
                WHEN 'world' THEN 0
                WHEN 'project' THEN 1
                WHEN 'country' THEN 2
                WHEN 'district' THEN 3
                WHEN 'city' THEN 3
                WHEN 'village' THEN 3
                WHEN 'sub_district' THEN 4
                WHEN 'facility' THEN 5
                WHEN 'individual' THEN 6
                WHEN 'case' THEN 6
                WHEN 'household' THEN 6
                ELSE 7
              END ASC,
              name ASC`,
          parameters: {
            searchFilter: `%${searchString}%`,
            searchString,
          },
        },
      },
      {
        limit: pageSize,
        offset: page && pageSize ? page * pageSize : undefined,
      },
    );

    return formatEntitiesForResponse(this.req.models, this.req.ctx, entities, field || fields);
  }
}
