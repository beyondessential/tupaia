/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';
import { BaseModel } from './BaseModel';

export class AncestorDescendantRelation extends BaseModel {
  static databaseType = TYPES.ANCESTOR_DESCENDANT_RELATION;

  static fields = ['id', 'ancestor_id', 'descendant_id', 'generational_distance'];

  static async getAncestorIds(entityId, hierarchyId) {
    const records = await AncestorDescendantRelation.find({
      descendant_id: entityId,
      hierarchy_id: hierarchyId,
    });
    return records.map(r => r.ancestor_id);
  }

  static async getDescendantIds(entityId, hierarchyId, criteria) {
    const records = await AncestorDescendantRelation.find({
      ancestor_id: entityId,
      hierarchy_id: hierarchyId,
      ...criteria,
    });
    return records.map(r => r.descendant_id);
  }

  static async getChildIds(entityId, hierarchyId, criteria) {
    return AncestorDescendantRelation.getDescendants(entityId, hierarchyId, {
      ...criteria,
      generational_distance: 1,
    });
  }
}
