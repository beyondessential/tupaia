/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary, reduceToArrayDictionary } from '@tupaia/utils';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class AncestorDescendantRelationType extends DatabaseType {
  static databaseType = TYPES.ANCESTOR_DESCENDANT_RELATION;

  static joins = [
    {
      joinWith: TYPES.ENTITY,
      joinAs: 'descendant',
      joinCondition: ['descendant_id', 'descendant.id'],
      fields: { code: 'descendant_code' },
    },
    {
      joinWith: TYPES.ENTITY,
      joinAs: 'ancestor',
      joinCondition: ['ancestor_id', 'ancestor.id'],
      fields: { code: 'ancestor_code' },
    },
  ];
}

export class AncestorDescendantRelationModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return AncestorDescendantRelationType;
  }

  async getImmediateRelations(hierarchyId, criteria) {
    return this.find({
      ...criteria,
      entity_hierarchy_id: hierarchyId,
      generational_distance: 1,
    });
  }

  async getChildIdToParentId(hierarchyId) {
    const relationRecords = await this.getImmediateRelations(hierarchyId);
    return reduceToDictionary(relationRecords, 'descendant_id', 'ancestor_id');
  }

  async getChildCodeToParentCode(hierarchyId) {
    const relationRecords = await this.getImmediateRelations(hierarchyId);
    return reduceToDictionary(relationRecords, 'descendant_code', 'ancestor_code');
  }

  async getParentIdToChildIds(hierarchyId) {
    const relationRecords = await this.getImmediateRelations(hierarchyId);
    return reduceToArrayDictionary(relationRecords, 'ancestor_id', 'descendant_id');
  }

  async getParentCodeToChildCodes(hierarchyId) {
    const relationRecords = await this.getImmediateRelations(hierarchyId);
    return reduceToArrayDictionary(relationRecords, 'ancestor_code', 'descendant_code');
  }
}
