/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EntityModel as BaseEntityModel, EntityRecord as BaseEntityRecord } from '@tupaia/database';
import { Model, DbFilter } from '@tupaia/server-boilerplate';

export type EntityFields = Readonly<{
  id: string;
  code: string;
  name: string;
  country_code: string | null;
  type: string | null;
  image_url: string | null;
  region: string | null;
  point: string | null;
  bounds: string | null;
  attributes: {
    type?: string;
  };
}>;

export type EntityQueryFields = EntityFields & {
  generational_distance: number;
};

export type EntityFilter = DbFilter<EntityQueryFields>;

export interface EntityRecord extends EntityFields, Omit<BaseEntityRecord, 'id'> {
  getChildren: (hierarchyId: string, criteria?: EntityFilter) => Promise<EntityRecord[]>;
  getParent: (hierarchyId: string) => Promise<EntityRecord | undefined>;
  getDescendants: (hierarchyId: string, criteria?: EntityFilter) => Promise<EntityRecord[]>;
  getAncestors: (hierarchyId: string, criteria?: EntityFilter) => Promise<EntityRecord[]>;
  getAncestorOfType: (hierarchyId: string, type: string) => Promise<EntityRecord | undefined>;
  getRelatives: (hierarchyId: string, criteria?: EntityFilter) => Promise<EntityRecord[]>;
}

export interface EntityModel extends Model<BaseEntityModel, EntityFields, EntityRecord> {
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
