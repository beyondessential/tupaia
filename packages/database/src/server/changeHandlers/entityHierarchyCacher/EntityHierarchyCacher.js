/**
 * @typedef {import('@tupaia/types').EntityHierarchy} EntityHierarchy
 * @typedef {import('@tupaia/types').Entity} Entity
 * @typedef {import('../../../core').EntityHierarchyRecord} EntityHierarchyRecord
 * @typedef {import('../../../core').ModelRegistry} ModelRegistry
 * @typedef {import('../../../core').ProjectRecord} ProjectRecord
 * @typedef {{
 *   new_record?: EntityHierarchy,
 *   old_record?: EntityHierarchy,
 *   record_id?: string,
 *   type: 'delete' | 'update' | string,
 * }} Change
 * @typedef {{
 *   hierarchyId: EntityHierarchy['id']
 *   rootEntityId: Entity['id']
 * }} RebuildJob
 * @typedef {(change: Change) => RebuildJob[] | null} ChangeTranslator
 */

import { SqlQuery } from '../../../core';
import { RECORDS } from '../../../core/records';
import { generateId } from '../../../core/utilities';
import { ChangeHandler } from '../ChangeHandler';

import { EntityHierarchySubtreeRebuilder } from './EntityHierarchySubtreeRebuilder';

export class EntityHierarchyCacher extends ChangeHandler {
  constructor(models) {
    super(models, 'entity-hierarchy-cacher');

    /** @satisfies {Record<string, ChangeTranslator>} */
    this.changeTranslators = /** @type {const} */ ({
      entity: change => this.translateEntityChangeToRebuildJobs(change),
      entityRelation: change => this.translateEntityRelationChangeToRebuildJobs(change),
      entityHierarchy: change => this.translateEntityHierarchyChangeToRebuildJobs(change),
    });
  }

  getTransactionWrapper() {
    return this.models.wrapInRepeatableReadTransaction.bind(this.models);
  }

  /** @type {ChangeTranslator} */
  async translateEntityChangeToRebuildJobs({ type, old_record: oldRecord, new_record: newRecord }) {
    // Should only rebuild if parent_id has changed
    if (
      type === 'update' &&
      oldRecord?.parent_id === newRecord?.parent_id &&
      oldRecord?.type === newRecord?.type &&
      oldRecord?.country_code === newRecord?.country_code
    ) {
      return [];
    }

    // if entity was deleted or created, or parent_id has changed, we need to delete subtrees and
    // rebuild all hierarchies
    /** @type {EntityHierarchyRecord[]} */
    const hierarchies = await this.models.entityHierarchy.all();
    const jobs = hierarchies.map(({ id: hierarchyId }) => ({
      hierarchyId,
      rootEntityId: newRecord.parent_id,
    }));
    return jobs;
  }

  /** @type {ChangeTranslator} */
  translateEntityRelationChangeToRebuildJobs({ old_record: oldRecord, new_record: newRecord }) {
    // delete and rebuild subtree from both old and new record, in case hierarchy and/or parent_id
    // have changed
    const jobs = [oldRecord, newRecord].filter(Boolean).map(r => ({
      hierarchyId: r.entity_hierarchy_id,
      rootEntityId: r.parent_id,
    }));
    return jobs;
  }

  /** @type {ChangeTranslator} */
  async translateEntityHierarchyChangeToRebuildJobs({
    record_id: hierarchyId,
    old_record: oldRecord,
    new_record: newRecord,
  }) {
    if (oldRecord && newRecord && oldRecord.canonical_types === newRecord.canonical_types) {
      return null; // if the canonical types are the same, the change won't invalidate the cache
    }
    /** @type {ProjectRecord[]} */
    const projectsUsingHierarchy = await this.models.project.find(
      { entity_hierarchy_id: hierarchyId },
      { columns: ['entity_id'] },
    );

    // delete and rebuild full hierarchy of any project using this entity
    /** @type {RebuildJob[]} */
    const jobs = projectsUsingHierarchy.map(p => ({
      hierarchyId,
      rootEntityId: p.entity_id,
    }));
    return jobs;
  }

  /**
   * @param {ModelRegistry} transactingModels
   * @param {RebuildJob[]} rebuildJobs
   */
  async handleChanges(transactingModels, rebuildJobs) {
    const subtreeRebuilder = new EntityHierarchySubtreeRebuilder(transactingModels);
    const relatedEntityIds = await subtreeRebuilder.rebuildSubtrees(rebuildJobs);

    if (relatedEntityIds.length > 0) {
      await transactingModels.database.executeSql(
        `
        UPDATE entity
        SET updated_at_sync_tick = 1
        WHERE id IN ${SqlQuery.record(relatedEntityIds)}
        `,
        relatedEntityIds,
      );
    }

    // explicitly flag ancestor_descendant_relation as changed so that model level caches are cleared
    // TODO: Remove this as part of RN-704
    await transactingModels.database.markRecordsAsChanged(
      RECORDS.ANCESTOR_DESCENDANT_RELATION,
      rebuildJobs.map(({ hierarchyId, rootEntityId }) => ({
        id: generateId(),
        hierarchyId,
        rootEntityId,
      })),
    );
  }
}
