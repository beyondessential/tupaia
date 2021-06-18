/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { PartialOrArray } from './types';
import { EntityFields } from './models';
import {
  SingleEntityRequest,
  DescendantsRequest,
  MultiEntityDescendantsRequest,
  RelativesRequest,
  MultiEntityRelativesRequest,
} from './routes';
import {
  GroupByAncestorRelationshipsResponseBody,
  GroupByDescendantRelationshipsResponseBody,
} from './routes/hierarchy/relationships';
import { FlattableEntityFieldName, ExtendedEntityFieldName } from './routes/hierarchy/types';

type EntityFilterObject = PartialOrArray<EntityFields>;
type ResBody<Type> = Type extends Request<any, infer sBody, any, any> ? sBody : never;

export type EntityApiQueryOptions = {
  field?: FlattableEntityFieldName;
  fields?: ExtendedEntityFieldName[];
  filter?: EntityFilterObject;
};
export type RelationshipsSubQueryOptions = Omit<EntityApiQueryOptions, 'fields'>;

export interface EntityApiInterface {
  getEntity: (
    hierarchyName: string,
    entityCode: string,
    queryOptions?: EntityApiQueryOptions,
  ) => Promise<ResBody<SingleEntityRequest>>;
  getDescendantsOfEntity: (
    hierarchyName: string,
    entityCode: string,
    queryOptions?: EntityApiQueryOptions,
    includeRootEntity?: boolean,
  ) => Promise<ResBody<DescendantsRequest>>;
  getDescendantsOfEntities: (
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: EntityApiQueryOptions,
    includeRootEntity?: boolean,
  ) => Promise<ResBody<MultiEntityDescendantsRequest>>;
  getRelativesOfEntity: (
    hierarchyName: string,
    entityCode: string,
    queryOptions?: EntityApiQueryOptions,
  ) => Promise<ResBody<RelativesRequest>>;
  getRelativesOfEntities: (
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: EntityApiQueryOptions,
  ) => Promise<ResBody<MultiEntityRelativesRequest>>;
  getRelationshipsOfEntityByAncestor: (
    hierarchyName: string,
    entityCode: string,
    queryOptions?: EntityApiQueryOptions,
    ancestorQueryOptions?: RelationshipsSubQueryOptions,
    descendantQueryOptions?: RelationshipsSubQueryOptions,
  ) => Promise<GroupByAncestorRelationshipsResponseBody>;
  getRelationshipsOfEntityByDescendant: (
    hierarchyName: string,
    entityCode: string,
    queryOptions?: EntityApiQueryOptions,
    ancestorQueryOptions?: RelationshipsSubQueryOptions,
    descendantQueryOptions?: RelationshipsSubQueryOptions,
  ) => Promise<GroupByDescendantRelationshipsResponseBody>;
  getRelationshipsOfEntitiesByAncestor: (
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: EntityApiQueryOptions,
    ancestorQueryOptions?: RelationshipsSubQueryOptions,
    descendantQueryOptions?: RelationshipsSubQueryOptions,
  ) => Promise<GroupByAncestorRelationshipsResponseBody>;
  getRelationshipsOfEntitiesByDescendant: (
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: EntityApiQueryOptions,
    ancestorQueryOptions?: RelationshipsSubQueryOptions,
    descendantQueryOptions?: RelationshipsSubQueryOptions,
  ) => Promise<GroupByDescendantRelationshipsResponseBody>;
}
