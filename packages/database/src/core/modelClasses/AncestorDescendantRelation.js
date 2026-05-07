import { SyncDirections } from '@tupaia/constants';
import { reduceToArrayDictionary, reduceToDictionary } from '@tupaia/utils';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

// TUP-3065: closure cache retired. The Record class is kept only because the model is
// still registered (table is dropped in TUP-3066). No live caller queries the table —
// the live methods on the Model below compute from entity.parent_id + project_country.
export class AncestorDescendantRelationRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ANCESTOR_DESCENDANT_RELATION;
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

  // TUP-3065/TUP-3060: pre-3065 these methods read from the ancestor_descendant_relation
  // closure cache. With the cacher retired, walk entity.parent_id directly — plus the
  // project_country bridge (a project entity → country edge that doesn't exist in
  // entity.parent_id since country.parent_id points at world rather than at any
  // particular project). The hierarchyId is still accepted for back-compat — we
  // resolve it to a project to scope both edge sources.
  async getParentIdRelationsForHierarchy(hierarchyId) {
    const project = hierarchyId
      ? await this.otherModels.project.findOne({ entity_hierarchy_id: hierarchyId })
      : null;
    const projectId = project?.id ?? null;
    const entityScopeClause = projectId ? '(child.project_id IS NULL OR child.project_id = ?)' : 'TRUE';
    const entityScopeParam = projectId ? [projectId] : [];
    const projectCountryScopeClause = projectId ? 'pc.project_id = ?' : 'TRUE';
    const projectCountryScopeParam = projectId ? [projectId] : [];

    const result = await this.database.executeSql(
      `
        -- entity.parent_id edges. Skip child.type IN ('project', 'country'): both point
        -- their parent_id at the world entity, but in the project-hierarchy model world
        -- is meta and project↔country edges come through project_country below. Keeping
        -- those rows would make World an ancestor of every project/country.
        SELECT child.id AS descendant_id,
               child.code AS descendant_code,
               parent.id AS ancestor_id,
               parent.code AS ancestor_code
        FROM entity child
        INNER JOIN entity parent ON parent.id = child.parent_id
        WHERE child.parent_id IS NOT NULL
          AND child.type NOT IN ('project', 'country')
          AND ${entityScopeClause}

        UNION ALL

        -- project_country bridge: project entity → country
        SELECT country_entity.id AS descendant_id,
               country_entity.code AS descendant_code,
               project_entity.id AS ancestor_id,
               project_entity.code AS ancestor_code
        FROM project_country pc
        INNER JOIN project p ON p.id = pc.project_id
        INNER JOIN entity project_entity ON project_entity.id = p.entity_id
        INNER JOIN entity country_entity ON country_entity.id = pc.country_id
        WHERE ${projectCountryScopeClause}
      `,
      [...entityScopeParam, ...projectCountryScopeParam],
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
