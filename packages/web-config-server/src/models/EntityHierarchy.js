/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';
import { BaseModel } from './BaseModel';

export class EntityHierarchy extends BaseModel {
  static databaseType = TYPES.ENTITY_HIERARCHY;

  static fields = ['id', 'name'];
}
