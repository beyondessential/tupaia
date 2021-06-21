/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';

import { PartialOrArray } from './types';
import { EntityFields } from './models';
import {
  SingleEntityRoute,
  MultiEntityRoute,
  EntityDescendantsRoute,
  MultiEntityDescendantsRoute,
  EntityRelativesRoute,
  MultiEntityRelativesRoute,
} from './routes';
import {
  GroupByAncestorRelationshipsResponseBody,
  GroupByDescendantRelationshipsResponseBody,
} from './routes/hierarchy/relationships';
import { FlattableEntityFieldName, ExtendedEntityFieldName } from './routes/hierarchy/types';

type EntityFilterObject = PartialOrArray<EntityFields>;
type ResponseOf<R> = R extends Route<any, any> ? ReturnType<R['buildResponse']> : never;

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
  ) => ResponseOf<SingleEntityRoute>;
  getEntities: (
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: EntityApiQueryOptions,
  ) => ResponseOf<MultiEntityRoute>;
  getDescendantsOfEntity: (
    hierarchyName: string,
    entityCode: string,
    queryOptions?: EntityApiQueryOptions,
    includeRootEntity?: boolean,
  ) => ResponseOf<EntityDescendantsRoute>;
  getDescendantsOfEntities: (
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: EntityApiQueryOptions,
    includeRootEntity?: boolean,
  ) => ResponseOf<MultiEntityDescendantsRoute>;
  getRelativesOfEntity: (
    hierarchyName: string,
    entityCode: string,
    queryOptions?: EntityApiQueryOptions,
  ) => ResponseOf<EntityRelativesRoute>;
  getRelativesOfEntities: (
    hierarchyName: string,
    entityCodes: string[],
    queryOptions?: EntityApiQueryOptions,
  ) => ResponseOf<MultiEntityRelativesRoute>;
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
