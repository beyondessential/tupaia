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
  MultiEntityRequestBody,
  EntityRequestQuery,
  SingleEntityContext,
  MultiEntityContext,
  FlattableEntityFieldName,
  FlattenedEntity,
  EntityResponse,
} from '../types';

export type Prefix<T, P extends string> = {
  [field in keyof T & string as `${P}_${field}`]: T[field];
};

export type RelationshipsSubQuery = Omit<EntityRequestQuery, 'fields'>;
export type RelationshipsQuery = RelationshipsSubQuery & {
  groupBy?: 'ancestor' | 'descendant';
} & Partial<Prefix<RelationshipsSubQuery, 'ancestor'>> &
  Partial<Prefix<RelationshipsSubQuery, 'descendant'>>;

type DescendantSubContext = {
  filter: EntityFilter;
  field: FlattableEntityFieldName;
  type: string;
};

type AncestorSubContext = {
  filter: EntityFilter;
  field: FlattableEntityFieldName;
  type?: string;
};

export type GroupByDescendantRelationshipsResponseBody = Record<FlattenedEntity, EntityResponse>;
export type GroupByAncestorRelationshipsResponseBody = Record<FlattenedEntity, EntityResponse[]>;
export type RelationshipsResponseBody =
  | GroupByDescendantRelationshipsResponseBody
  | GroupByAncestorRelationshipsResponseBody;

export type RelationshipsContext = Omit<SingleEntityContext, 'fields'> & {
  ancestor: AncestorSubContext;
  descendant: DescendantSubContext;
};

export interface RelationshipsRequest
  extends Request<
    SingleEntityRequestParams,
    RelationshipsResponseBody,
    RequestBody,
    RelationshipsQuery
  > {
  ctx: RelationshipsContext;
}

export type MultiEntityRelationshipsContext = Omit<MultiEntityContext, 'fields'> & {
  ancestor: AncestorSubContext;
  descendant: DescendantSubContext;
};

export interface MultiEntityRelationshipsRequest
  extends Request<
    MultiEntityRequestParams,
    RelationshipsResponseBody,
    MultiEntityRequestBody,
    RelationshipsQuery
  > {
  ctx: MultiEntityRelationshipsContext;
}
