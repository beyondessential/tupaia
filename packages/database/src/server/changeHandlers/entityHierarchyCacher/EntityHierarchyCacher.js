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

    // When an entity moves from parent A to parent B, both subtrees are affected and need
    // rebuilding - that's the natural translation of this change into rebuild jobs, similar to when
    // entity_relation is changed
    //
    // Without the old parent, deleteSubtrees only looks for descendants of the new parent in the
    // stale ancestor_descendant_relation, and won't find the moved entity — leaving its old
    // records intact and causing cacheGeneration to skip it as "already cached".
    //
    // Previously this wasn't needed because rootEntityId was the entity itself (not its parent),
    // so deleteSubtrees always included it directly in entityIdsForDelete. After the introduction
    // of entity_parent_child_relation, rootEntityId needs to be the parent for
    // EntityParentChildRelationBuilder, exposing this gap.
    //
    // When parent_id hasn't changed, this deduplicates to a single element, preserving original behaviour.
    const parentIds = [...new Set([oldRecord?.parent_id, newRecord?.parent_id].filter(Boolean))];

    /** @type {EntityHierarchyRecord[]} */
    const hierarchies = await this.models.entityHierarchy.all();
    const jobs = hierarchies.flatMap(({ id: hierarchyId }) =>
      parentIds.map(parentId => ({
        hierarchyId,
        rootEntityId: parentId,
      })),
    );
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
    await subtreeRebuilder.rebuildSubtrees(rebuildJobs);

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
