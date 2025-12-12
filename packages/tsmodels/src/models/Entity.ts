import { EntityModel as BaseEntityModel, EntityRecord as BaseEntityRecord } from '@tupaia/database';
import { Entity } from '@tupaia/types';
import { Model, DbFilter } from './types';

export interface EntityFilterFields extends Entity {
  generational_distance: number;
}

export type EntityFilter = DbFilter<EntityFilterFields>;

// allow the possibility of passing in own fields
export interface EntityRecord extends Entity, BaseEntityRecord {
  getChildren: (hierarchyId: string, criteria?: EntityFilter) => Promise<EntityRecord[]>;
  getParentFromParentChildRelation: (hierarchyId: string) => Promise<EntityRecord | undefined>;
  getChildrenFromParentChildRelation: (
    hierarchyId: string,
    criteria?: EntityFilter,
  ) => Promise<EntityRecord[]>;
  getParent: (hierarchyId: string) => Promise<EntityRecord | undefined>;
  getDescendants: (
    hierarchyId: string,
    criteria?: EntityFilter,
    options?: Record<string, unknown>,
  ) => Promise<EntityRecord[]>;
  getAncestors: (hierarchyId: string, criteria?: EntityFilter) => Promise<EntityRecord[]>;
  getAncestorOfType: (hierarchyId: string, type: string) => Promise<EntityRecord | undefined>;
  getRelatives: (hierarchyId: string, criteria?: EntityFilter) => Promise<EntityRecord[]>;
}

export interface EntityModel extends Model<BaseEntityModel, Entity, EntityRecord> {
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
