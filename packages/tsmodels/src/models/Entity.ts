import { EntityModel as BaseEntityModel, EntityRecord as BaseEntityRecord } from '@tupaia/database';
import { Entity } from '@tupaia/types';
import { Model, DbFilter } from './types';

export interface EntityFilterFields extends Entity {
  generational_distance: number;
}

export type EntityFilter = DbFilter<EntityFilterFields>;

// allow the possibility of passing in own fields
export interface EntityRecord extends Entity, BaseEntityRecord {
  getChildren: (projectId: string, criteria?: EntityFilter) => Promise<EntityRecord[]>;
  getParentFromParentChildRelation: (projectId: string) => Promise<EntityRecord | undefined>;
  getChildrenFromParentChildRelation: (
    projectId: string,
    criteria?: EntityFilter,
  ) => Promise<EntityRecord[]>;
  getParent: (projectId: string) => Promise<EntityRecord | undefined>;
  getDescendants: (
    projectId: string,
    criteria?: EntityFilter,
    options?: Record<string, unknown>,
  ) => Promise<EntityRecord[]>;
  getAncestors: (projectId: string, criteria?: EntityFilter) => Promise<EntityRecord[]>;
  getAncestorOfType: (projectId: string, type: string) => Promise<EntityRecord | undefined>;
  getRelatives: (projectId: string, criteria?: EntityFilter) => Promise<EntityRecord[]>;
}

export interface EntityModel extends Model<BaseEntityModel, Entity, EntityRecord> {
  findOneByCodeInProject: (
    code: string,
    projectId?: string | null,
    otherCriteria?: EntityFilter,
    options?: Record<string, unknown>,
  ) => Promise<EntityRecord | null>;
  getDescendantsOfEntities: (
    projectId: string,
    entityIds: string[],
    criteria?: EntityFilter,
  ) => Promise<EntityRecord[]>;
  getRelativesOfEntities: (
    projectId: string,
    entityIds: string[],
    criteria?: EntityFilter,
  ) => Promise<EntityRecord[]>;
  getAncestorsOfEntities: (
    projectId: string,
    entityIds: string[],
    criteria?: EntityFilter,
  ) => Promise<EntityRecord[]>;
}
