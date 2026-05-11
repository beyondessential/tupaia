/**
 * @typedef {import('@tupaia/types').Entity} Entity
 * @typedef {import('@tupaia/types').EntityHierarchy} EntityHierarchy
 * @typedef {import('@tupaia/types').Project} Project
 * @typedef {import('../../../core').ModelRegistry} ModelRegistry
 */

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

      // The parent_id leg must NOT cross the world entity. project.parent_id and
      // country.parent_id both point at world; if those edges leaked into the closure
      // the world entity would surface as an ancestor of every project/country (and
      // entity-server would 403 the resulting `parent_code: 'World'` walk). Both
      // relationships are expressed elsewhere — country↔project comes through
      // project_country, project↔world is meta and not modelled in the cache.
      //
      // We do NOT filter by canonical_types: the closure is meant to mirror every
      // entity-id-linked relation, including non-org-unit types like individual /
      // case / household. Pre-3068 the cacher walked entity_relation rows for those
      // (which were inserted without type-filter), so the equivalent here is to
      // include any sub-country entity reachable via parent_id.
      //
      // ancestor_descendant_relation.id is TEXT with no SQL default. Generate a
      // deterministic id from (hierarchy, ancestor, descendant, distance). MD5 is
      // fast and gives 32 hex chars — well within the column's TEXT bounds. Using a
      // deterministic value means re-runs produce stable ids.
      await transactingModels.database.executeSql(
        `
        WITH RECURSIVE
          edges AS (
            -- entity.parent_id direct edges, project-scoped. Excludes
            -- child.type IN ('project','country') because those rows' parent_id is
            -- the world entity; their hierarchy ancestry comes through
            -- project_country instead.
            SELECT e.parent_id AS ancestor_id, e.id AS descendant_id
            FROM entity e
            WHERE e.parent_id IS NOT NULL
              AND e.type NOT IN ('project', 'country')
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
        [projectId, projectId, hierarchyId, hierarchyId],
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
}
