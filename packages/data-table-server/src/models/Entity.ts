/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EntityModel as BaseEntityModel, EntityType as BaseEntityType } from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import type { Entity } from '@tupaia/types';

export type EntityFields = Readonly<Entity>;

// inconsistency between js-to-ts type from @tupaia/database and db-to-ts from @tupaia/types
type BaseEntityTypeWithoutMetadata = Omit<BaseEntityType, 'metadata'>;

export interface EntityType extends EntityFields, Omit<BaseEntityTypeWithoutMetadata, 'id'> {}

export interface EntityModel extends Model<BaseEntityModel, EntityFields, EntityType> {}
