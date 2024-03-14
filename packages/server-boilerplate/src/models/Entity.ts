/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EntityModel as BaseEntityModel, EntityRecord as BaseEntityRecord } from '@tupaia/database';
import { Entity } from '@tupaia/types';
import { Model, DbFilter } from './types';

type Required<T> = {
  [P in keyof T]-?: T[P];
};

// We also want to make all fields as non-optional
export type EntityFields = Required<Entity>;

export type EntityFilterFields = EntityFields & {
  generational_distance: number;
};

export type EntityFilter = DbFilter<EntityFilterFields>;

// allow the possibility of passing in own fields
export interface EntityRecord extends EntityFields, Omit<BaseEntityRecord, 'metadata' | 'id'> {
  getChildren: (hierarchyId: string, criteria?: EntityFilter) => Promise<EntityRecord[]>;
  getParent: (hierarchyId: string) => Promise<EntityRecord | undefined>;
  getDescendants: (hierarchyId: string, criteria?: EntityFilter) => Promise<EntityRecord[]>;
  getAncestors: (hierarchyId: string, criteria?: EntityFilter) => Promise<EntityRecord[]>;
  getAncestorOfType: (hierarchyId: string, type: string) => Promise<EntityRecord | undefined>;
  getRelatives: (hierarchyId: string, criteria?: EntityFilter) => Promise<EntityRecord[]>;
}

export interface EntityModel
  extends Model<
    Omit<
      BaseEntityModel,
      'getDescendantsOfEntities' | 'getRelativesOfEntities' | 'getAncestorsOfEntities'
    >,
    EntityFields,
    EntityRecord
  > {
  getDescendantsOfEntities: (
    hierarchyId: string,
    entityIds: string[],
    criteria?: EntityFilter,
  ) => Promise<EntityRecord[]>;
  getRelativesOfEntities: (
    hierarchyId: string,
    entityIds: string[],
    criteria?: EntityFilter,
  ) => Promise<EntityRecord[]>;
  getAncestorsOfEntities: (
    hierarchyId: string,
    entityIds: string[],
    criteria?: EntityFilter,
  ) => Promise<EntityRecord[]>;
}
