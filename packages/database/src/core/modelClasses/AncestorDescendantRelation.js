import { reduceToDictionary, reduceToArrayDictionary } from '@tupaia/utils';
import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class AncestorDescendantRelationRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ANCESTOR_DESCENDANT_RELATION;

  static joins = /** @type {const} */ ([
    {
      joinWith: RECORDS.ENTITY,
      joinAs: 'descendant',
      joinCondition: ['descendant_id', 'descendant.id'],
      fields: { code: 'descendant_code' },
    },
    {
      joinWith: RECORDS.ENTITY,
      joinAs: 'ancestor',
      joinCondition: ['ancestor_id', 'ancestor.id'],
      fields: { code: 'ancestor_code' },
    },
  ]);
}

export class AncestorDescendantRelationModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return AncestorDescendantRelationRecord;
  }

  get cacheEnabled() {
    return true;
  }

  get cacheDependencies() {
    // ancestor_descendant_relation will be manually flagged as changed once it's been rebuilt
    return [RECORDS.ANCESTOR_DESCENDANT_RELATION];
  }

  async getImmediateRelations(hierarchyId, criteria) {
    return this.find({
      ...criteria,
      entity_hierarchy_id: hierarchyId,
      generational_distance: 1,
    });
  }

  async getChildIdToParentId(hierarchyId) {
    const cacheKey = this.getCacheKey(this.getChildIdToParentId.name, hierarchyId);
    return this.runCachedFunction(cacheKey, async () => {
      const relationRecords = await this.getImmediateRelations(hierarchyId);
      return reduceToDictionary(relationRecords, 'descendant_id', 'ancestor_id');
    });
  }

  async getChildCodeToParentCode(hierarchyId) {
    const cacheKey = this.getCacheKey(this.getChildCodeToParentCode.name, hierarchyId);
    return this.runCachedFunction(cacheKey, async () => {
      const relationRecords = await this.getImmediateRelations(hierarchyId);
      return reduceToDictionary(relationRecords, 'descendant_code', 'ancestor_code');
    });
  }

  async getParentIdToChildIds(hierarchyId) {
    const cacheKey = this.getCacheKey(this.getParentIdToChildIds.name, hierarchyId);
    return this.runCachedFunction(cacheKey, async () => {
      const relationRecords = await this.getImmediateRelations(hierarchyId);
      return reduceToArrayDictionary(relationRecords, 'ancestor_id', 'descendant_id');
    });
  }

  async getParentCodeToChildCodes(hierarchyId) {
    const cacheKey = this.getCacheKey(this.getParentCodeToChildCodes.name, hierarchyId);
    return this.runCachedFunction(cacheKey, async () => {
      const relationRecords = await this.getImmediateRelations(hierarchyId);
      return reduceToArrayDictionary(relationRecords, 'ancestor_code', 'descendant_code');
    });
  }
}
