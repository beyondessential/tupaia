/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';
import { BaseModel } from './BaseModel';

export class AncestorDescendantRelation extends BaseModel {
  static databaseType = TYPES.ANCESTOR_DESCENDANT_RELATION;

  static fields = [
    'id',
    'ancestor_id',
    'ancestor_code',
    'ancestor_type',
    'descendant_id',
    'descendant_code',
    'descendant_type',
  ];

  static async getAncestorIds(entityId, hierarchyId, criteria = {}) {
    const { type } = criteria;
    const records = await AncestorDescendantRelation.find({
      descendant_id: entityId,
      hierarchy_id: hierarchyId,
      ancestor_type: type,
    });
    return records.map(r => r.ancestor_id);
  }

  static async getAncestorCodes(entityId, hierarchyId, criteria = {}) {
    const { type } = criteria;
    const records = await AncestorDescendantRelation.find({
      descendant_id: entityId,
      hierarchy_id: hierarchyId,
      ancestor_type: type,
    });
    return records.map(r => r.ancestor_code);
  }

  static async getDescendantIds(entityId, hierarchyId, criteria = {}) {
    const { type } = criteria;
    const records = await AncestorDescendantRelation.find({
      ancestor_id: entityId,
      hierarchy_id: hierarchyId,
      descendant_type: type,
    });
    return records.map(r => r.descendant_id);
  }

  static async getChildIds(entityId, hierarchyId, criteria) {
    return AncestorDescendantRelation.getDescendants(entityId, hierarchyId, {
      ...criteria,
      generational_distance: 1,
    });
  }

  static async getEntityCodeToAncestorMap(entities, hierarchyId, criteria) {
    const records = await AncestorDescendantRelation.find({
      descendant_id: entities.map(e => e.id),
      hierarchy_id: hierarchyId,
      ...criteria,
    });
    const entityCodeToAncestorMap = {};
    records.forEach(r => {
      entityCodeToAncestorMap[r.descendant_code] = { code: r.ancestor_code, name: r.ancestor_name };
    });
    return entityCodeToAncestorMap;
  }
}
