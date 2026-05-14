/**
 * @typedef {import('@tupaia/types').Entity} Entity
 * @typedef {import('@tupaia/types').EntityHierarchy} EntityHierarchy
 * @typedef {import('@tupaia/types').Project} Project
 * @typedef {import('../../../core').ModelRegistry} ModelRegistry
 */

import {
  PROJECT_HIERARCHY_EDGES_SUBQUERY,
  projectHierarchyEdgesParams,
} from '../../../core/modelClasses/projectHierarchyEdges';

/**
 * Rebuilds `ancestor_descendant_relation` for a single project in one recursive CTE.
 */
export class AncestorDescendantCacheBuilder {
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

    await this.models.wrapInTransaction(async transactingModels => {
      await transactingModels.database.executeSql(
        `DELETE FROM ancestor_descendant_relation WHERE entity_hierarchy_id = ?;`,
        [hierarchyId],
      );

      // ancestor_descendant_relation.id is TEXT with no SQL default. Generate a
      // deterministic id from (hierarchy, ancestor, descendant, distance). MD5 is
      // fast and gives 32 hex chars — well within the column's TEXT bounds. Using a
      // deterministic value means re-runs produce stable ids.
      await transactingModels.database.executeSql(
        `
        WITH RECURSIVE
          edges AS (${PROJECT_HIERARCHY_EDGES_SUBQUERY}),
          closure AS (
            -- base case: each direct edge becomes a (ancestor, descendant, 1) row
            SELECT ancestor_id, descendant_id, 1 AS generational_distance
            FROM edges
            UNION ALL
            -- recursive case: extend each closure row by one more descendant edge.
            -- Depth cap is a safety belt against cyclic entity.parent_id data —
            -- real Tupaia hierarchies are 5-6 levels max; 50 is a comfortable
            -- ceiling that bounds the damage if parent_id ever becomes circular.
            SELECT c.ancestor_id, e.descendant_id, c.generational_distance + 1
            FROM closure c
            INNER JOIN edges e ON e.ancestor_id = c.descendant_id
            WHERE c.generational_distance < 50
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
        [...projectHierarchyEdgesParams(projectId), hierarchyId, hierarchyId],
      );
    });
  }

  /**
   * @public
   * Rebuild the closure for every project — used at boot when the cache is empty.
   * Bounded-parallel: each project's rebuild owns its hierarchy_id rows so there's
   * no cross-project DB contention, but we cap concurrency to avoid saturating the
   * connection pool on prod (60 projects × N pool connections).
   */
  async rebuildAll() {
    const CONCURRENCY = 5;
    const projects = await this.models.project.all();
    const queue = [...projects];
    const worker = async () => {
      while (queue.length > 0) {
        const project = queue.shift();
        if (!project) return;
        await this.rebuildForProject(project.id);
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  }
}
