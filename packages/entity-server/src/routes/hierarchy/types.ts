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

type FlattenAndPrefix<T, K extends keyof T & string> = {
  [V in K]: { [field in keyof T[V] & string as `${V}.${field}`]: T[V][field] };
}[K];

type ObjectLikeKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends Record<string, any> ? K : never;
}[keyof T];

type SimpleFieldKeys<T> = {
  [K in keyof T]: T[K] extends string | number | symbol ? K : never;
}[keyof T];

type EntityFilterQuery = Partial<
  Omit<EntityFields, ObjectLikeKeys<EntityFields>> &
    FlattenAndPrefix<EntityFields, ObjectLikeKeys<EntityFields>>
>;

export interface HierarchyRequestQuery extends EntityFilterQuery {
  fields?: string;
  field?: string;
}

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

export type EntityResponse =
  | EntityResponseObject
  | FlattableEntityFields[keyof FlattableEntityFields];

export interface HierarchyContext {
  entity: EntityType;
  hierarchyId: string;
  allowedCountries: string[];
  fields: (keyof ExtendedEntityFields)[];
  flat?: keyof FlattableEntityFields;
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
