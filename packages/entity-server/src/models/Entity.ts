/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EntityModel as BaseEntityModel, EntityType as BaseEntityType } from '@tupaia/database';
import { Model, DbConditional } from '@tupaia/server-boilerplate';

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

export type EntityFilter = DbConditional<EntityFields>;

export interface EntityType extends EntityFields, Omit<BaseEntityType, 'id'> {
  getChildren: (hierarchyId: string, criteria?: EntityFilter) => Promise<EntityType[]>;
  getParent: (hierarchyId: string) => Promise<EntityType | undefined>;
  getDescendants: (hierarchyId: string, criteria?: EntityFilter) => Promise<EntityType[]>;
  getAncestorOfType: (hierarchyId: string, type: string) => Promise<EntityType>;
  getRelatives: (hierarchyId: string, criteria?: EntityFilter) => Promise<EntityType[]>;
}

export interface EntityModel extends Model<BaseEntityModel, EntityFields, EntityType> {
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
}
