/**
 * Single source of truth for "the set of (ancestor, descendant) edges in a
 * project's entity hierarchy".
 */
export const PROJECT_HIERARCHY_EDGES_SUBQUERY = `
  SELECT e.parent_id AS ancestor_id, e.id AS descendant_id
  FROM entity e
  WHERE e.parent_id IS NOT NULL
    AND e.type NOT IN ('project', 'country')
    AND (e.project_id IS NULL OR e.project_id = ?)
  UNION ALL
  SELECT p.entity_id AS ancestor_id, pc.country_id AS descendant_id
  FROM project_country pc
  INNER JOIN project p ON p.id = pc.project_id
  WHERE pc.project_id = ?
`;

/** @param {string} projectId */
export const projectHierarchyEdgesParams = projectId => [projectId, projectId];
