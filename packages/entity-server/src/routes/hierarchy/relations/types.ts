/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { EntityFilter } from '../../../models';
import {
  HierarchyRequest,
  HierarchyRequestParams,
  HierarchyRequestBody,
  HierarchyRequestQuery,
  HierarchyContext,
  FlattableEntityFields,
  FlattenedEntity,
  EntityResponse,
} from '../types';

export type Prefix<T, P extends string> = {
  [field in keyof T & string as `${P}_${field}`]: T[field];
};

export type RelationsSubQuery = Omit<HierarchyRequestQuery, 'fields'>;
export type RelationsQuery = RelationsSubQuery & {
  groupBy?: 'ancestor' | 'descendant';
} & Partial<Prefix<RelationsSubQuery, 'ancestor'>> &
  Partial<Prefix<RelationsSubQuery, 'descendant'>>;

type RelationsSubContext = {
  filter: EntityFilter;
  flat: keyof FlattableEntityFields;
  type: string;
};
export interface RelationsRequest
  extends HierarchyRequest<
    HierarchyRequestParams,
    | Record<FlattenedEntity, EntityResponse> // groupBy: descendant
    | Record<FlattenedEntity, EntityResponse[]>, // groupBy: ancestor
    HierarchyRequestBody,
    RelationsQuery
  > {
  ctx: HierarchyContext & {
    ancestor: RelationsSubContext;
    descendant: RelationsSubContext;
  };
}
