/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { formatEntitiesForResponse } from './format';
import {
  MultiEntityRequest,
  MultiEntityRequestParams,
  MultiEntityRequestBody,
  EntityRequestQuery,
  EntityResponse,
} from './types';
import { AncestorDescendantRelationType } from '../../models';

export type EntitySearchRequest = MultiEntityRequest<
  MultiEntityRequestParams & { searchString: string },
  EntityResponse[],
  MultiEntityRequestBody,
  EntityRequestQuery & { pageSize?: number; page?: number; projectCode?: string }
>;
export class EntitySearchRoute extends Route<EntitySearchRequest> {
  public async buildResponse() {
    const { fields, field, filter } = this.req.ctx;
    const { searchString: rawString } = this.req.params;
    const { pageSize, page, projectCode } = this.req.query;
    const searchString = rawString.toLowerCase();
    let projectFilter = {};

    // We can either search all entities, or search for entities within a project
    if (projectCode) {
      const project = await this.req.models.project.findOne({
        code: projectCode,
      });
      const relations = await this.req.models.ancestorDescendantRelation.find({
        entity_hierarchy_id: project.entity_hierarchy_id,
        'ancestor.id': project.entity_id,
      });
      projectFilter = {
        id: relations.map((rel: AncestorDescendantRelationType) => rel['descendant.id']),
      };
    }

    const entities = await this.req.models.entity.find(
      {
        ...filter,
        ...projectFilter,
        // Name filter last so we don't allow overriding it
        name: {
          comparator: 'ilike',
          comparisonValue: `%${searchString}%`,
        },
      },
      {
        // Put names that begin with the search string first
        // Then sort alphabetically within the two groups
        rawSort: `STARTS_WITH(LOWER(name),'${searchString}') DESC, name ASC`,
        limit: pageSize,
        offset: page && pageSize ? page * pageSize : undefined,
      },
    );

    return formatEntitiesForResponse(this.req.models, this.req.ctx, entities, field || fields);
  }
}
