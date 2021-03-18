/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, Response } from 'express';
import { EntityFields, EntityType } from '../../models';
import { extendedFieldFunctions } from './extendedFieldFunctions';
import { Resolved } from '../../types';

export interface HierarchyRequestParams {
  hierarchyName: string;
  entityCode: string;
}

export type HierarchyRequestBody = Record<string, unknown>;

export interface HierarchyRequestQuery {
  fields?: string;
}

export type ExtendedFieldFunctions = Readonly<
  {
    [field in keyof typeof extendedFieldFunctions]: Resolved<
      ReturnType<typeof extendedFieldFunctions[field]>
    >;
  }
>;

export type ExtendedEntityFields = EntityFields & ExtendedFieldFunctions;

export type EntityResponseObject = {
  [field in keyof ExtendedEntityFields]?: ExtendedEntityFields[field];
};

export interface HierarchyContext {
  entity: EntityType;
  hierarchyId: string;
  fields: (keyof ExtendedEntityFields)[];
  formatEntityForResponse: (entity: EntityType) => Promise<EntityResponseObject>;
  formatEntitiesForResponse: (entities: EntityType[]) => Promise<EntityResponseObject[]>;
  allowedCountries: string[];
}

export interface HierarchyRequest<
  P = HierarchyRequestParams,
  ResBody = EntityResponseObject,
  ReqBody = HierarchyRequestBody,
  ReqQuery = HierarchyRequestQuery
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  context: HierarchyContext;
}

export interface HierarchyResponse<ResBody = EntityResponseObject> extends Response<ResBody> {
  context: HierarchyContext;
}
