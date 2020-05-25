/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary } from '@tupaia/utils';
import { TYPES } from '@tupaia/database';
import { BaseModel } from './BaseModel';

export class EntityRelation extends BaseModel {
  static databaseType = TYPES.ENTITY_RELATION;

  static fields = ['id', 'parent_id', 'child_id', 'entity_hierarchy_id'];

  static async getChildIdToParentIdMap(entityHierarchyId) {
    return reduceToDictionary(
      await EntityRelation.find({ entity_hierarchy_id: entityHierarchyId }),
      'child_id',
      'parent_id',
    );
  }
}
