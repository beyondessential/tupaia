/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { Request } from 'express';
import { EntityFilter } from '../../../models';
import {
  SingleEntityRequestParams,
  MultiEntityRequestParams,
  RequestBody,
  SingleEntityRequestQuery,
  SingleEntityContext,
  MultiEntityContext,
  FlattableEntityFields,
  FlattenedEntity,
  EntityResponse,
} from '../types';

export type Prefix<T, P extends string> = {
  [field in keyof T & string as `${P}_${field}`]: T[field];
};

export type RelationsSubQuery = Omit<SingleEntityRequestQuery, 'fields'>;
export type RelationsQuery = RelationsSubQuery & {
  groupBy?: 'ancestor' | 'descendant';
} & Partial<Prefix<RelationsSubQuery, 'ancestor'>> &
  Partial<Prefix<RelationsSubQuery, 'descendant'>>;

type DescendantSubContext = {
  filter: EntityFilter;
  field: keyof FlattableEntityFields;
  type: string;
};

type AncestorSubContext = {
  filter: EntityFilter;
  field: keyof FlattableEntityFields;
  type?: string;
};

export type RelationsResponseBody =
  | Record<FlattenedEntity, EntityResponse> // groupBy: descendant
  | Record<FlattenedEntity, EntityResponse[]>; // groupBy: ancestor

export type RelationsContext = Omit<SingleEntityContext, 'fields'> & {
  ancestor: AncestorSubContext;
  descendant: DescendantSubContext;
};

export interface RelationsRequest
  extends Request<SingleEntityRequestParams, RelationsResponseBody, RequestBody, RelationsQuery> {
  ctx: RelationsContext;
}

export interface MultiEntityRelationsRequest
  extends Request<
    MultiEntityRequestParams,
    RelationsResponseBody,
    RequestBody,
    RelationsQuery & { entities?: string }
  > {
  ctx: Omit<MultiEntityContext, 'fields'> & {
    ancestor: AncestorSubContext;
    descendant: DescendantSubContext;
  };
}
