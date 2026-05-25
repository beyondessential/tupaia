/**
 * Translate a canonical entity id (the id MediTrak holds) into the
 * project-specific row id for a given project.
 *
 * Lookup order:
 *   1. Resolve the canonical row by id → take its `code`.
 *   2. Use `Entity.findOneByCodeInProject(code, projectId)` to find the
 *      project-specific sibling. This helper handles the structural-fallback
 *      semantics (project-specific row wins over a `project_id IS NULL` row).
 *   3. If no sibling exists, lazy-duplicate the canonical row into the
 *      project: copy all fields, set `project_id`, let `generate_object_id()`
 *      issue a fresh id.
 *
 * Returns the project-specific entity id (or the new lazy-duplicate's id).
 *
 * Edge case: if `canonicalEntityId` itself belongs to `projectId` (e.g. the
 * survey is for the project that owns the canonical row), this returns
 * `canonicalEntityId` unchanged — `findOneByCodeInProject` finds the same row.
 *
 * @param {ModelRegistry} models
 * @param {{ canonicalEntityId: string, projectId: string }} args
 * @returns {Promise<string>} project-specific entity id
 */
export const resolveCanonicalEntityForProject = async (
  models,
  { canonicalEntityId, projectId },
) => {
  if (!canonicalEntityId) {
    throw new Error('resolveCanonicalEntityForProject requires canonicalEntityId');
  }
  if (!projectId) {
    throw new Error('resolveCanonicalEntityForProject requires projectId');
  }

  const canonical = await models.entity.findById(canonicalEntityId);
  if (!canonical) {
    throw new Error(`No entity found with id ${canonicalEntityId}`);
  }

  const existing = await models.entity.findOneByCodeInProject(canonical.code, projectId);
  if (existing) return existing.id;

  // Lazy-duplicate. Strip the id (so the model issues a fresh one) and the
  // canonical row's project_id (we're moving into a different project).
  const { id: _ignored, project_id: _alsoIgnored, ...fields } = canonical;
  const duplicate = await models.entity.create({
    ...fields,
    project_id: projectId,
  });
  return duplicate.id;
};
