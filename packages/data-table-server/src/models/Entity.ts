/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EntityModel as BaseEntityModel, EntityRecord as BaseEntityRecord } from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import type { Entity } from '@tupaia/types';

export type EntityFields = Readonly<Entity>;

// inconsistency between js-to-ts type from @tupaia/database and db-to-ts from @tupaia/types
type BaseEntityRecordWithoutMetadata = Omit<BaseEntityRecord, 'metadata'>;

export interface EntityRecord extends EntityFields, Omit<BaseEntityRecordWithoutMetadata, 'id'> {}

export interface EntityModel extends Model<BaseEntityModel, EntityFields, EntityRecord> {}
