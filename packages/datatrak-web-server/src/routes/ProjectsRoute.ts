/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebProjectsRequest } from '@tupaia/types';

export type ProjectsRequest = Request<
  DatatrakWebProjectsRequest.Params,
  DatatrakWebProjectsRequest.ResBody,
  DatatrakWebProjectsRequest.ReqBody,
  DatatrakWebProjectsRequest.ReqQuery
>;

const columns = [
  'code',
  'config',
  'dashboard_group_name',
  'default_measure',
  'description',
  'entity.name',
  'entity_hierarchy_id',
  'entity_id',
  'id',
  'image_url',
  'logo_url',
  'permission_groups',
  'sort_order',
];

export class ProjectsRoute extends Route<ProjectsRequest> {
  public async buildResponse() {
    const { ctx, query = {} } = this.req;
    const projects = await ctx.services.central.fetchResources('projects', {
      columns,
    });
    return camelcaseKeys(projects, { deep: true });
  }
}
