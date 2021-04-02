/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, Response } from 'express';
import { EntityFields, EntityType, EntityFilter } from '../../models';
import { extendedFieldFunctions } from './extendedFieldFunctions';
import { Resolved, ObjectLikeKeys } from '../../types';

export interface HierarchyRequestParams {
  hierarchyName: string;
  entityCode: string;
}

export type HierarchyRequestBody = Record<string, unknown>;

type FlattenAndPrefix<T, K extends keyof T & string> = {
  [V in K]: { [field in keyof T[V] & string as `${V}.${field}`]: T[V][field] };
}[K];

type SimpleFieldKeys<T> = {
  [K in keyof T]: T[K] extends string | number | symbol ? K : never;
}[keyof T];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

export type NestedFilterQueryFields = UnionToIntersection<
  FlattenAndPrefix<EntityFields, ObjectLikeKeys<EntityFields>>
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

export type EntityResponse =
  | EntityResponseObject
  | FlattableEntityFields[keyof FlattableEntityFields];

export interface HierarchyContext {
  entity: EntityType;
  hierarchyId: string;
  allowedCountries: string[];
  fields: (keyof ExtendedEntityFields)[];
  filter: EntityFilter;
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
