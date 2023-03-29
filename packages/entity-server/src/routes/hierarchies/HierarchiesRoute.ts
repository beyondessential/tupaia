/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { QueryConjunctions, Route } from '@tupaia/server-boilerplate';
import { formatEntitiesForResponse } from './format';
import { FlattenedHierarchy, HierarchyContext, HierarchyResponseObject } from './types';

type ReqParams = Record<string, never>;
type ResBody = HierarchyResponseObject[] | FlattenedHierarchy[];
type ReqBody = Record<string, never>;

interface ReqQuery {
  fields?: string;
  field?: string;
}

export interface HierarchyRequest extends Request<ReqParams, ResBody, ReqBody, ReqQuery> {
  ctx: HierarchyContext;
}

export class HierarchyRoute extends Route<HierarchyRequest> {
  public async buildResponse() {
    const { field, fields } = this.req.ctx;

    const allPermissionGroups = this.req.accessPolicy.getPermissionGroups();
    const countryCodesByPermissionGroup: Record<string, string[]> = {};
    // Generate lists of country codes we have access to per permission group
    allPermissionGroups.forEach(pg => {
      countryCodesByPermissionGroup[pg] = this.req.accessPolicy.getEntitiesAllowed(pg);
    });

    const entities = await this.req.models.entity.find(
      {
        type: 'project',
        [QueryConjunctions.RAW]: {
          // Pulls permission_group/country_code pairs from the project
          // Returns any project where we have access to at least one of those pairs
          sql: `(
            SELECT COUNT(*) > 0 FROM
            (
              SELECT UNNEST(project.permission_groups) as permission_group, child_entity.country_code
              FROM entity as child_entity
              INNER JOIN entity_relation
                ON entity_relation.child_id = child_entity.id
                AND entity_relation.parent_id = project.entity_id
                AND entity_relation.entity_hierarchy_id = project.entity_hierarchy_id
            ) AS count
            WHERE country_code IN
            (
              SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->permission_group)::TEXT)
            )
          )`,
          parameters: [JSON.stringify(countryCodesByPermissionGroup)],
        },
      },
      {
        sort: ['name'],
        joinWith: 'project',
      },
    );

    return formatEntitiesForResponse(entities, field || fields);
  }
}
