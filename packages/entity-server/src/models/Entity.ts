/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EntityModel as BaseEntityModel, EntityType as BaseEntityType } from '@tupaia/database';
import { Model } from './types';

export type EntityFields = Readonly<{
  id: string;
  code: string;
  country_code: string;
}>;

export interface EntityType extends EntityFields, Omit<BaseEntityType, 'id'> {
  getChildren: (hierarchyId: string) => Promise<EntityType[]>;
  getParent: (hierarchyId: string) => Promise<EntityType | undefined>;
  getDescendants: (hierarchyId: string) => Promise<EntityType[]>;
}

export interface EntityModel extends Model<BaseEntityModel, EntityFields, EntityType> {}
