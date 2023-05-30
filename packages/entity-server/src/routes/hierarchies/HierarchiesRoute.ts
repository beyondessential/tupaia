/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import keyBy from 'lodash.keyby';

import { Route } from '@tupaia/server-boilerplate';
import { formatHierarchiesForResponse } from './format';
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

    const projects = await this.req.models.project.getAccessibleProjects(this.req.accessPolicy);
    const projectsByEntityId = keyBy(projects, 'entity_id');
    const entities = await this.req.models.entity.find(
      { id: projects.map(p => p.entity_id) },
      { sort: ['name'] },
    );

    const hierarchies = entities.map(entity => {
      const project = projectsByEntityId[entity.id];

      return {
        id: project.entity_hierarchy_id,
        code: project.code,
        name: entity.name,
      };
    });

    return formatHierarchiesForResponse(hierarchies, field || fields);
  }
}
