/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';
import { BaseModel } from './BaseModel';

export class EntityRelation extends BaseModel {
  static databaseType = TYPES.ENTITY_RELATION;

  static fields = ['id', 'parent_id', 'child_id', 'hierarchy'];
}
