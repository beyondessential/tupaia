/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { PartialOrArray } from '@tupaia/server-boilerplate';

import { EntityFields } from './models';
import {
  FlattableEntityFieldName,
  ExtendedEntityFieldName,
  EntityResponseObject,
} from './routes/hierarchy/types';

export type EntityFilterObject = PartialOrArray<EntityFields>;

export type EntityApiQueryOptions = {
  field?: FlattableEntityFieldName;
  fields?: ExtendedEntityFieldName[];
  filter?: EntityFilterObject;
};
export type RelationshipsSubQueryOptions = Omit<EntityApiQueryOptions, 'fields'>;

export type EntityApiResponse<T extends ExtendedEntityFieldName[]> = Required<
  Pick<EntityResponseObject, T[number]>
>;

export {
  GroupByAncestorRelationshipsResponseBody,
  GroupByDescendantRelationshipsResponseBody,
} from './routes/hierarchy/relationships';

export {
  FlattableEntityFieldName,
  ExtendedEntityFieldName,
  EntityResponseObject,
  FlattenedEntity,
} from './routes/hierarchy/types';
