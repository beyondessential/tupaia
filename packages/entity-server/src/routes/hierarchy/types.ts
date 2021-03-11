/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ParamsDictionary, Query } from 'express-serve-static-core';
import { Request, Response } from 'express';
import { Context } from '../../types';
import { EntityFields, EntityType } from '../../models';

interface HierarchyRequestParams extends ParamsDictionary {
  projectCode: string;
  entityCode: string;
}

interface HierarchyRequestQuery extends Query {
  fields?: string;
}

export type EntityResponseObject = {
  [field in keyof EntityFields]?: EntityFields[field];
};

// eslint-disable-next-line @typescript-eslint/comma-dangle
export interface HierarchyRequest<
  P = HierarchyRequestParams,
  ResBody = EntityResponseObject,
  ReqBody = Record<string, never>,
  ReqQuery = HierarchyRequestQuery
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  context: Context<{ entity: EntityType; entityHierarchyId: string }>;
}

export interface HierarchyResponse<ResBody = EntityResponseObject> extends Response<ResBody> {
  context: Context<{ formatEntityForResponse: (entity: EntityType) => EntityResponseObject }>;
}
