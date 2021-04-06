/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import {
  HierarchyRequest,
  HierarchyRequestParams,
  HierarchyRequestBody,
  HierarchyRequestQuery,
  EntityResponseObject,
  FlattenedEntity,
  EntityResponse,
} from '../types';

export type Prefix<T, P extends string> = {
  [field in keyof T & string as `${P}_${field}`]: T[field];
};

export type RelationsQuery = HierarchyRequestQuery & {
  groupBy?: 'ancestor' | 'descendant';
} & Partial<Prefix<HierarchyRequestQuery, 'ancestor'>> &
  Partial<Prefix<HierarchyRequestQuery, 'descendant'>>;

export interface RelationsRequest
  extends HierarchyRequest<
    HierarchyRequestParams,
    | (EntityResponseObject & { ancestor: EntityResponse })[] // groupBy: descendant, flat: false
    | (EntityResponseObject & { descendants: EntityResponse[] })[] // groupBy: ancestor, flat: false
    | Record<FlattenedEntity, EntityResponse>[] // groupBy: descendant, flat: true
    | Record<FlattenedEntity, EntityResponse[]>[], // groupBy: ancestor, flat: true
    HierarchyRequestBody,
    RelationsQuery
  > {
  ctx: HierarchyRequest['ctx'] & {
    ancestor: Pick<HierarchyRequest['ctx'], 'flat' | 'fields' | 'filter'> & { type: string };
    descendant: Pick<HierarchyRequest['ctx'], 'flat' | 'fields' | 'filter'> & { type: string };
  };
}
