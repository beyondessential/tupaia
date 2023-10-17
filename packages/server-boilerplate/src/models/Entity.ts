/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { EntityModel as BaseEntityModel, EntityType as BaseEntityType } from '@tupaia/database';
import { Entity } from '@tupaia/types';
import { Model, DbFilter } from './types';

export type EntityFilterFields = Entity & {
  generational_distance: number;
};

export type EntityFilter = DbFilter<EntityFilterFields>;

// inconsistency between js-to-ts type from @tupaia/database and db-to-ts from @tupaia/types
type BaseEntityTypeWithoutMetadata = Omit<BaseEntityType, 'metadata'>;

export interface EntityType extends Entity, BaseEntityTypeWithoutMetadata {
  getChildren: (hierarchyId: string, criteria?: EntityFilter) => Promise<EntityType[]>;
  getParent: (hierarchyId: string) => Promise<EntityType | undefined>;
  getDescendants: (hierarchyId: string, criteria?: EntityFilter) => Promise<EntityType[]>;
  getAncestors: (hierarchyId: string, criteria?: EntityFilter) => Promise<EntityType[]>;
  getAncestorOfType: (hierarchyId: string, type: string) => Promise<EntityType | undefined>;
  getRelatives: (hierarchyId: string, criteria?: EntityFilter) => Promise<EntityType[]>;
}

type EntityModelOverrides = {
  getDescendantsOfEntities: (
    hierarchyId: string,
    entityIds: string[],
    criteria?: EntityFilter,
  ) => Promise<EntityType[]>;
  getRelativesOfEntities: (
    hierarchyId: string,
    entityIds: string[],
    criteria?: EntityFilter,
  ) => Promise<EntityType[]>;
  getAncestorsOfEntities: (
    hierarchyId: string,
    entityIds: string[],
    criteria?: EntityFilter,
  ) => Promise<EntityType[]>;
};

export interface EntityModel
  extends Model<Omit<BaseEntityModel, keyof EntityModelOverrides>, Entity, EntityType>,
    EntityModelOverrides {}
