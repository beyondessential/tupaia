/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class EntityHierarchyType extends DatabaseType {
  static databaseType = TYPES.ENTITY_HIERARCHY;
}

export class EntityHierarchyModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return EntityHierarchyType;
  }
}
