/**
 * @typedef {import('@tupaia/types').EntityHierarchy} EntityHierarchy
 * @typedef {import('@tupaia/types').Entity} Entity
 * @typedef {import('@tupaia/types').Project} Project
 * @typedef {import('../../../core').ModelRegistry} ModelRegistry
 * @typedef {import('../../../core').ProjectRecord} ProjectRecord
 * @typedef {{
 *   new_record?: object,
 *   old_record?: object,
 *   record_id?: string,
 *   type: 'delete' | 'update' | string,
 * }} Change
 * @typedef {Project['id']} ProjectId
 * @typedef {(change: Change) => Promise<ProjectId[]> | ProjectId[] | null} ChangeTranslator
 */

import { RECORDS } from '../../../core/records';
import { generateId } from '../../../core/utilities';
import { ChangeHandler } from '../ChangeHandler';
import { AncestorDescendantCacheBuilder } from './AncestorDescendantCacheBuilder';

/**
 * Listens for changes that affect a project's entity hierarchy and rebuilds the
 * `ancestor_descendant_relation` closure cache for the affected projects.
 *
 * Triggered by:
 *   - entity changes (parent_id, type, or project_id moves)
 *   - project_country changes (project ↔ country edge add/remove)
 *   - entity_hierarchy changes (canonical_types changes)
 */
export class EntityHierarchyCacher extends ChangeHandler {
  constructor(models) {
    super(models, 'entity-hierarchy-cacher');

    /** @satisfies {Record<string, ChangeTranslator>} */
    this.changeTranslators = /** @type {const} */ ({
      entity: change => this.translateEntityChange(change),
      projectCountry: change => this.translateProjectCountryChange(change),
      entityHierarchy: change => this.translateEntityHierarchyChange(change),
    });
  }

  /** @type {ChangeTranslator} */
  async translateEntityChange({ type, old_record: oldRecord, new_record: newRecord }) {
    // Only structural changes invalidate the closure: parent_id, project_id, or type
    // moves. Name/metadata edits don't affect ancestor_descendant_relation.
    if (
      type === 'update' &&
      oldRecord?.parent_id === newRecord?.parent_id &&
      oldRecord?.project_id === newRecord?.project_id &&
      oldRecord?.type === newRecord?.type
    ) {
      return [];
    }

    // Sub-country entities have a non-null project_id, which IS the scope to rebuild —
    // no need to walk outward via project_country or project.entity_id.
    const subCountryProjectIds = [oldRecord?.project_id, newRecord?.project_id].filter(Boolean);
    if (subCountryProjectIds.length > 0) {
      return [...new Set(subCountryProjectIds)];
    }

    // Structural entities (project, country, world) have project_id NULL. Derive
    // owning project(s) by walking outward: a project entity's project record, or a
    // country's project_country rows.
    const candidateEntityIds = [
      oldRecord?.id,
      newRecord?.id,
      oldRecord?.parent_id,
      newRecord?.parent_id,
    ].filter(Boolean);
    if (candidateEntityIds.length === 0) {
      return [];
    }

    const projectIds = new Set();
    const projectsByEntity = await this.models.project.find({ entity_id: candidateEntityIds });
    projectsByEntity.forEach(p => projectIds.add(p.id));

    const projectCountryRows = await this.models.projectCountry.find({
      country_id: candidateEntityIds,
    });
    projectCountryRows.forEach(pc => projectIds.add(pc.project_id));

    return Array.from(projectIds);
  }

  /** @type {ChangeTranslator} */
  translateProjectCountryChange({ old_record: oldRecord, new_record: newRecord }) {
    return [oldRecord?.project_id, newRecord?.project_id].filter(Boolean);
  }

  /** @type {ChangeTranslator} */
  async translateEntityHierarchyChange({
    record_id: hierarchyId,
    old_record: oldRecord,
    new_record: newRecord,
  }) {
    if (oldRecord && newRecord && oldRecord.canonical_types === newRecord.canonical_types) {
      return null;
    }
    /** @type {ProjectRecord[]} */
    const projectsUsingHierarchy = await this.models.project.find({
      entity_hierarchy_id: hierarchyId,
    });
    return projectsUsingHierarchy.map(p => p.id);
  }

  /**
   * @param {ModelRegistry} transactingModels
   * @param {ProjectId[]} projectIds
   */
  async handleChanges(transactingModels, projectIds) {
    const builder = new AncestorDescendantCacheBuilder(transactingModels);
    const uniqueProjectIds = [...new Set(projectIds)];

    for (const projectId of uniqueProjectIds) {
      await builder.rebuildForProject(projectId);
    }

    // Flag ancestor_descendant_relation as changed so model-level caches invalidate.
    await transactingModels.database.markRecordsAsChanged(
      RECORDS.ANCESTOR_DESCENDANT_RELATION,
      uniqueProjectIds.map(projectId => ({ id: generateId(), projectId })),
    );
  }
}
