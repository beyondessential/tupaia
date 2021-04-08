/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, Response } from 'express';
import { EntityFields, EntityType, EntityFilter } from '../../models';
import { extendedFieldFunctions } from './extendedFieldFunctions';
import { Resolved, ObjectLikeKeys, Flatten } from '../../types';

export interface HierarchyRequestParams {
  hierarchyName: string;
  entityCode: string;
}

export type HierarchyRequestBody = Record<string, unknown>;

type SimpleFieldKeys<T> = {
  [K in keyof T]: T[K] extends string | number | symbol ? K : never;
}[keyof T];

export type NestedFilterQueryFields = Flatten<
  Pick<EntityFields, ObjectLikeKeys<EntityFields>>,
  '_'
>;

type StringValues<T> = {
  [field in keyof T]: string;
};

export type EntityFilterQuery = Partial<
  StringValues<Omit<EntityFields, ObjectLikeKeys<EntityFields>> & NestedFilterQueryFields>
>;

export type HierarchyRequestQuery = {
  fields?: string;
  field?: string;
} & EntityFilterQuery;

export type ExtendedFieldFunctions = Readonly<
  {
    [field in keyof typeof extendedFieldFunctions]: Resolved<
      ReturnType<typeof extendedFieldFunctions[field]>
    >;
  }
>;

type ExcludeCommonFields<T, U> = Omit<T, Extract<keyof T, keyof U>>;

export type FlattableEntityFields = Pick<EntityFields, SimpleFieldKeys<EntityFields>>;

export type ExtendedEntityFields = ExcludeCommonFields<EntityFields, ExtendedFieldFunctions> &
  ExtendedFieldFunctions;

export type EntityResponseObject = {
  [field in keyof ExtendedEntityFields]?: ExtendedEntityFields[field];
};

export type FlattenedEntity = FlattableEntityFields[keyof FlattableEntityFields];

export type EntityResponse = EntityResponseObject | FlattenedEntity;

export interface HierarchyContext {
  entity: EntityType;
  hierarchyId: string;
  allowedCountries: string[];
  fields: (keyof ExtendedEntityFields)[];
  filter: EntityFilter;
  field?: keyof FlattableEntityFields;
}

export interface HierarchyRequest<
  P = HierarchyRequestParams,
  ResBody = EntityResponse,
  ReqBody = HierarchyRequestBody,
  ReqQuery = HierarchyRequestQuery
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  ctx: HierarchyContext;
}

export interface HierarchyResponse<ResBody = EntityResponse> extends Response<ResBody> {
  ctx: HierarchyContext;
}
