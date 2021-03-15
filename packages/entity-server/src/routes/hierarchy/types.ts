/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, Response } from 'express';
import { Context } from '../../types';
import { EntityFields, EntityType } from '../../models';

interface HierarchyRequestParams {
  hierarchyName: string;
  entityCode: string;
}

interface HierarchyRequestQuery {
  fields?: string;
}

export type EntityResponseObject = {
  [field in keyof EntityFields]?: EntityFields[field];
};

export interface HierarchyRequest<
  P = HierarchyRequestParams,
  ResBody = EntityResponseObject,
  ReqBody = Record<string, unknown>,
  ReqQuery = HierarchyRequestQuery
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  context: Context<{ entity: EntityType; hierarchyId: string }>;
}

export interface HierarchyResponse<ResBody = EntityResponseObject> extends Response<ResBody> {
  context: Context<{ formatEntityForResponse: (entity: EntityType) => EntityResponseObject }>;
}
