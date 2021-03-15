/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EntityModel as BaseEntityModel, EntityType as BaseEntityType } from '@tupaia/database';
import { Model } from './types';

export interface EntityFields {
  readonly code: string;
  readonly country_code: string;
}

export interface EntityType extends BaseEntityType, EntityFields {
  getChildren: (hierarchyId: string) => Promise<EntityType[]>;
}

export interface EntityModel extends Model<BaseEntityModel, EntityFields, EntityType> {}
