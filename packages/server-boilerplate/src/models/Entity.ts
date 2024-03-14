/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EntityModel as BaseEntityModel, EntityRecord as BaseEntityRecord } from '@tupaia/database';
import { Entity } from '@tupaia/types';
import { Model, DbFilter } from './types';

export type EntityFilterFields = Entity & {
  generational_distance: number;
};

export type EntityFilter = DbFilter<EntityFilterFields>;

// allow the possibility of passing in own fields
export interface EntityRecord extends Entity, Omit<BaseEntityRecord, 'metadata' | 'id'> {
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
    Entity,
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
