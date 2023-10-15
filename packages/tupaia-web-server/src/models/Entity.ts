/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { EntityModel as BaseEntityModel, EntityType } from '@tupaia/database';
import { Entity } from '@tupaia/types';
import { Model } from '@tupaia/server-boilerplate';

export interface EntityModel extends Model<BaseEntityModel, Entity, EntityType> {}
