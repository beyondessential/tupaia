import { SyncDirections } from '@tupaia/constants';
import { reduceToArrayDictionary, reduceToDictionary } from '@tupaia/utils';
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
    // TUP-3065: closure cache is no longer maintained, but cache invalidation still
    // tracks any direct writes to the table (e.g. a manual rebuild during a one-off
    // migration). Entity-level cache tracking is what most callers care about now.
    return [RECORDS.ANCESTOR_DESCENDANT_RELATION, RECORDS.ENTITY];
  }

  async getImmediateRelations(hierarchyId, criteria) {
    return this.find({
      ...criteria,
      entity_hierarchy_id: hierarchyId,
      generational_distance: 1,
    });
  }

  // TUP-3065: pre-3065 these methods read from the ancestor_descendant_relation closure
  // cache. With the cacher retired, walk entity.parent_id directly. The hierarchyId is
  // still accepted for back-compat — we resolve it to a project to scope the walk so
  // that returning dictionaries don't include sibling projects' duplicates.
  async getParentIdRelationsForHierarchy(hierarchyId) {
    const project = hierarchyId
      ? await this.otherModels.project.findOne({ entity_hierarchy_id: hierarchyId })
      : null;
    const projectId = project?.id ?? null;
    const projectScopeClause = projectId ? '(project_id IS NULL OR project_id = ?)' : 'TRUE';
    const projectScopeParam = projectId ? [projectId] : [];

    const result = await this.database.executeSql(
      `
        SELECT child.id AS descendant_id,
               child.code AS descendant_code,
               parent.id AS ancestor_id,
               parent.code AS ancestor_code
        FROM entity child
        INNER JOIN entity parent ON parent.id = child.parent_id
        WHERE child.parent_id IS NOT NULL
          AND ${projectScopeClause}
      `,
      projectScopeParam,
    );
    return result;
  }

  async getChildIdToParentId(hierarchyId) {
    const cacheKey = this.getCacheKey(this.getChildIdToParentId.name, hierarchyId);
    return this.runCachedFunction(cacheKey, async () => {
      const relationRecords = await this.getParentIdRelationsForHierarchy(hierarchyId);
      return reduceToDictionary(relationRecords, 'descendant_id', 'ancestor_id');
    });
  }

  async getChildCodeToParentCode(hierarchyId) {
    const cacheKey = this.getCacheKey(this.getChildCodeToParentCode.name, hierarchyId);
    return this.runCachedFunction(cacheKey, async () => {
      const relationRecords = await this.getParentIdRelationsForHierarchy(hierarchyId);
      return reduceToDictionary(relationRecords, 'descendant_code', 'ancestor_code');
    });
  }

  async getParentIdToChildIds(hierarchyId) {
    const cacheKey = this.getCacheKey(this.getParentIdToChildIds.name, hierarchyId);
    return this.runCachedFunction(cacheKey, async () => {
      const relationRecords = await this.getParentIdRelationsForHierarchy(hierarchyId);
      return reduceToArrayDictionary(relationRecords, 'ancestor_id', 'descendant_id');
    });
  }

  async getParentCodeToChildCodes(hierarchyId) {
    const cacheKey = this.getCacheKey(this.getParentCodeToChildCodes.name, hierarchyId);
    return this.runCachedFunction(cacheKey, async () => {
      const relationRecords = await this.getParentIdRelationsForHierarchy(hierarchyId);
      return reduceToArrayDictionary(relationRecords, 'ancestor_code', 'descendant_code');
    });
  }
}
