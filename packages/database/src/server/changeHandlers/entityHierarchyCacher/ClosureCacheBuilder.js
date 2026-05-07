/**
 * @typedef {import('@tupaia/types').Entity} Entity
 * @typedef {import('@tupaia/types').EntityHierarchy} EntityHierarchy
 * @typedef {import('@tupaia/types').Project} Project
 * @typedef {import('../../../core').ModelRegistry} ModelRegistry
 */

import { ORG_UNIT_ENTITY_TYPES } from '../../../core/modelClasses/Entity';
import { SqlQuery } from '../../../core/SqlQuery';

/**
 * Rebuilds `ancestor_descendant_relation` for a single project in one recursive CTE.
 *
 * TUP-3068: simplifies the previous 3-class pipeline (Cacher → SubtreeRebuilder →
 * ParentChildBuilder) which conditionally walked `entity_relation` or
 * `entity.parent_id` at each level. Post-RN-1853 / TUP-3065 the source of truth is:
 *
 *   - `entity.parent_id` for direct sub-country edges (district → facility, etc.)
 *   - `project_country` for the project_entity → country bridge (country.parent_id
 *     points at world, which is meta and shouldn't surface as an ancestor)
 *
 * The recursive CTE walks both edge sources transitively, scoped to one project, and
 * INSERTs straight into `ancestor_descendant_relation`. No intermediate
 * `entity_parent_child_relation` table is used or maintained — that table is dropped
 * in TUP-3066.
 */
export class ClosureCacheBuilder {
  /** @param {ModelRegistry} models */
  constructor(models) {
    this.models = models;
  }

  /**
   * @public
   * @param {Project['id']} projectId
   */
  async rebuildForProject(projectId) {
    const project = await this.models.project.findById(projectId);
    if (!project) return;

    const { entity_hierarchy_id: hierarchyId } = project;

    const canonicalTypes = await this.getCanonicalTypes(hierarchyId);
    // The parent_id leg must NOT cross the world entity. project.parent_id and
    // country.parent_id both point at world; if those edges leaked into the closure
    // the world entity would surface as an ancestor of every project/country (and
    // entity-server would 403 the resulting `parent_code: 'World'` walk). Both
    // relationships are expressed elsewhere — country↔project comes through
    // project_country, project↔world is meta and not modelled in the cache.
    const parentIdLegTypes = canonicalTypes.filter(t => t !== 'project' && t !== 'country');

    // Wipe-and-rebuild rather than diff. The closure for one project's hierarchy is
    // typically tens to hundreds of thousands of rows — small enough that DELETE +
    // INSERT-from-SELECT is faster and simpler than computing the symmetric
    // difference. Wrap in a transaction so consumers don't observe a half-rebuilt
    // cache.
    await this.models.wrapInTransaction(async transactingModels => {
      await transactingModels.database.executeSql(
        `DELETE FROM ancestor_descendant_relation WHERE entity_hierarchy_id = ?;`,
        [hierarchyId],
      );

      // ancestor_descendant_relation.id is TEXT with no SQL default, so we generate a
      // deterministic-ish id from (hierarchy, ancestor, descendant, distance). MD5 is
      // fast and gives 32 hex chars — well within the column's TEXT bounds. Using a
      // deterministic value (not random) means re-runs produce stable ids, which keeps
      // change-detection noise low for any future sync of this table.
      await transactingModels.database.executeSql(
        `
        WITH RECURSIVE
          edges AS (
            -- entity.parent_id direct edges, project-scoped, sub-country only.
            -- Excludes child.type IN ('project','country') because those rows'
            -- parent_id is the world entity; their hierarchy ancestry comes through
            -- project_country instead.
            SELECT e.parent_id AS ancestor_id, e.id AS descendant_id
            FROM entity e
            WHERE e.parent_id IS NOT NULL
              AND e.type IN ${SqlQuery.record(parentIdLegTypes)}
              AND (e.project_id IS NULL OR e.project_id = ?)
            UNION ALL
            -- project_country bridge: project_entity → country
            SELECT p.entity_id, pc.country_id
            FROM project_country pc
            INNER JOIN project p ON p.id = pc.project_id
            WHERE pc.project_id = ?
          ),
          closure AS (
            -- base case: each direct edge becomes a (ancestor, descendant, 1) row
            SELECT ancestor_id, descendant_id, 1 AS generational_distance
            FROM edges
            UNION ALL
            -- recursive case: extend each closure row by one more descendant edge
            SELECT c.ancestor_id, e.descendant_id, c.generational_distance + 1
            FROM closure c
            INNER JOIN edges e ON e.ancestor_id = c.descendant_id
          )
        INSERT INTO ancestor_descendant_relation
          (id, entity_hierarchy_id, ancestor_id, descendant_id, generational_distance)
        SELECT
          MD5(? || '|' || ancestor_id || '|' || descendant_id || '|' || generational_distance::text),
          ?,
          ancestor_id,
          descendant_id,
          generational_distance
        FROM closure;
        `,
        [...parentIdLegTypes, projectId, projectId, hierarchyId, hierarchyId],
      );
    });
  }

  /**
   * @public
   * Rebuild the closure for every project — used at boot when the cache is empty.
   */
  async rebuildAll() {
    const projects = await this.models.project.all();
    for (const project of projects) {
      await this.rebuildForProject(project.id);
    }
  }

  /**
   * @private
   * @param {EntityHierarchy['id']} hierarchyId
   */
  async getCanonicalTypes(hierarchyId) {
    const hierarchy = await this.models.entityHierarchy.findById(hierarchyId);
    const customCanonicalTypes = hierarchy?.canonical_types;
    return customCanonicalTypes?.length > 0
      ? customCanonicalTypes
      : Object.values(ORG_UNIT_ENTITY_TYPES);
  }
}
