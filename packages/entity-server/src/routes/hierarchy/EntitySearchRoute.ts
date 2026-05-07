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

    const entities = await this.req.models.entity.find(
      {
        ...filter,
        [RAW]: {
          // Running this RAW is much faster for larger hierarchies
          // Put names that begin with the search string first
          // Then sort parent entity types before child types (e.g. countries before facilities)
          // Finally sort alphabetically
          sql: `id IN (
              SELECT descendant_id
              FROM ancestor_descendant_relation
              WHERE entity_hierarchy_id = :hierarchyId
            )
            AND name ILIKE :searchFilter
            ORDER BY
              STARTS_WITH(LOWER(name), :searchString) DESC,
              (
                SELECT MAX(generational_distance) FROM ancestor_descendant_relation
                WHERE entity_hierarchy_id = :hierarchyId
                AND descendant_id = entity.id
                GROUP BY descendant_id
              ) ASC,
              name ASC`,
          parameters: {
            hierarchyId,
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
