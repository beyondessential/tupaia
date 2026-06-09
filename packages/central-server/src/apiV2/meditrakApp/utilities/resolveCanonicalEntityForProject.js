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
 * @param {{ cache?: Map<string, Promise<string>>, visiting?: Set<string> }} [options]
 *   `cache` coalesces concurrent/repeat resolutions within a batch (see
 *   `createCachedEntityResolver`); `visiting` tracks the current ancestor chain
 *   for cycle detection during lazy-duplication. Both are threaded through the
 *   parent recursion. Omit for a standalone one-off resolution.
 * @returns {Promise<string>} project-specific entity id
 */
export const resolveCanonicalEntityForProject = (
  models,
  { canonicalEntityId, projectId },
  { cache, visiting } = {},
) => {
  if (!canonicalEntityId) {
    throw new Error('resolveCanonicalEntityForProject requires canonicalEntityId');
  }
  if (!projectId) {
    throw new Error('resolveCanonicalEntityForProject requires projectId');
  }

  // A cycle in the hierarchy (A → B → A) would otherwise recurse forever (or,
  // with a cache, deadlock awaiting its own pending promise). Bail loudly.
  if (visiting?.has(canonicalEntityId)) {
    throw new Error(`Entity hierarchy cycle detected at ${canonicalEntityId}`);
  }

  // Coalesce: if this (projectId, canonicalEntityId) is already being resolved
  // in this batch, return the in-flight promise rather than racing a second
  // lazy-duplicate (which would collide on UNIQUE(code, project_id)).
  const cacheKey = `${projectId}:${canonicalEntityId}`;
  if (cache?.has(cacheKey)) return cache.get(cacheKey);

  const resolution = (async () => {
    const canonical = await models.entity.findById(canonicalEntityId);
    if (!canonical) {
      throw new Error(`No entity found with id ${canonicalEntityId}`);
    }

    const existing = await models.entity.findOneByCodeInProject(canonical.code, projectId);
    if (existing) return existing.id;

    // Lazy-duplicate the canonical row into the project. point/bounds are
    // geometry columns the model reads back as GeoJSON (ST_AsGeoJSON), which
    // can't be inserted into a geometry column as-is — pull them out of the
    // create() payload and set them in a follow-up UPDATE via ST_GeomFromGeoJSON.
    const {
      id: _ignored,
      project_id: _alsoIgnored,
      parent_id: canonicalParentId,
      point,
      bounds,
      ...fields
    } = await canonical.getData();
    const parentId = canonicalParentId
      ? await resolveCanonicalEntityForProject(
          models,
          { canonicalEntityId: canonicalParentId, projectId },
          { cache, visiting: new Set(visiting).add(canonicalEntityId) },
        )
      : null;
    const duplicate = await models.entity.create({
      ...fields,
      parent_id: parentId,
      project_id: projectId,
    });
    if (point || bounds) {
      await models.database.executeSql(
        `UPDATE entity
         SET point = COALESCE(ST_GeomFromGeoJSON(?), point),
             bounds = COALESCE(ST_GeomFromGeoJSON(?), bounds)
         WHERE id = ?;`,
        [point ?? null, bounds ?? null, duplicate.id],
      );
    }
    return duplicate.id;
  })();

  cache?.set(cacheKey, resolution);
  return resolution;
};

/**
 * Build a resolver bound to a shared cache, so all entity-id translations for a
 * single sync submission (entities_upserted, their parents, answer bodies, the
 * response's own entity_id) coalesce: each (projectId, canonicalEntityId) is
 * resolved — and lazy-duplicated — at most once, even under the concurrent
 * `Promise.all` in `upsertEntitiesAndOptions`.
 *
 * @param {ModelRegistry} models
 * @returns {(args: { canonicalEntityId: string, projectId: string }) => Promise<string>}
 */
export const createCachedEntityResolver = models => {
  const cache = new Map();
  return args => resolveCanonicalEntityForProject(models, args, { cache });
};
