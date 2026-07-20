/** @typedef {import('../Entity').EntityRecord} EntityRecord */

import { toMerged } from 'es-toolkit';
import winston from 'winston';

/**
 * @typedef ResolveEntityId
 * @type {(args: { canonicalEntityId: string, projectId: string }) => Promise<string>}
 *
 * Optional id resolver for legacy clients (MediTrak) that hold canonical ids
 * and need them mapped to project-specific row ids. Datatrak and other callers
 * pass entity ids that already match project-specific rows, so they omit this.
 */

/**
 * Order entities so each parent is upserted before any child that references it within the same
 * batch. A new parent + new child in one submission would otherwise fail: the upserts can't run
 * concurrently (the child's parent_id FK is checked before the parent row exists). Throws on a
 * cycle in the batch's parent references — which also covers mutually-referential submissions the
 * lazy-duplication cycle guard never sees.
 */
const orderEntitiesParentFirst = resolvedEntities => {
  const byId = new Map(resolvedEntities.map(resolved => [resolved.resolvedId, resolved]));
  const ordered = [];
  const state = new Map(); // resolvedId -> 'visiting' | 'done'
  const visit = resolved => {
    const status = state.get(resolved.resolvedId);
    if (status === 'done') return;
    if (status === 'visiting') {
      throw new Error(
        `Entity hierarchy cycle detected among submitted entities (code ${resolved.entityToUpsert.code})`,
      );
    }
    state.set(resolved.resolvedId, 'visiting');
    const { parent_id: parentId } = resolved.entityToUpsert;
    const parent = parentId ? byId.get(parentId) : undefined;
    if (parent && parent.resolvedId !== resolved.resolvedId) visit(parent);
    state.set(resolved.resolvedId, 'done');
    ordered.push(resolved);
  };
  for (const resolved of resolvedEntities) visit(resolved);
  return ordered;
};

const upsertEntities = async (models, entitiesUpserted, { resolveEntityId, projectId } = {}) => {
  // Phase 1 — resolve every entity against the PRE-BATCH db state (in parallel). Resolution must
  // not depend on rows inserted earlier in the same batch, so it happens up front before any of
  // the batch entities are written.
  const resolvedEntities = await Promise.all(
    entitiesUpserted.map(async entity => {
      // For MediTrak-style payloads (canonical id), translate both the entity
      // id and its parent_id into project-specific rows via the resolver.
      // Datatrak skips this — its ids are already project-specific.
      let resolvedId = entity.id;
      let resolvedParentId = entity.parent_id;
      let resolvedProjectId;
      if (resolveEntityId && projectId) {
        // Skip resolution when the entity row doesn't exist yet — this is the
        // first time MediTrak has synced it. The canonical id becomes the
        // project-specific id and we set project_id to the survey's project.
        const existingCanonical = await models.entity.findById(entity.id);
        if (existingCanonical) {
          resolvedId = await resolveEntityId({ canonicalEntityId: entity.id, projectId });
        } else {
          resolvedProjectId = projectId;
        }
        // Resolve parent_id too — unless the parent is itself brand-new in this
        // same batch (not yet in the DB). For a new parent the canonical id
        // becomes its project-specific id (same skip path as the entity above),
        // so the child's canonical parent_id already points at the right row.
        if (entity.parent_id) {
          const existingParent = await models.entity.findById(entity.parent_id);
          if (existingParent) {
            resolvedParentId = await resolveEntityId({
              canonicalEntityId: entity.parent_id,
              projectId,
            });
          }
        }
      }

      const entityWithResolvedIds = {
        ...entity,
        id: resolvedId,
        ...(entity.parent_id ? { parent_id: resolvedParentId } : {}),
        ...(resolvedProjectId ? { project_id: resolvedProjectId } : {}),
      };

      /** @type {EntityRecord | null} */
      const existingEntity = await models.entity.findById(resolvedId, {
        columns: [
          // Non-nullable attributes with no DEFAULT, needed for `INSERT ... ON CONFLICT` query
          // (MediTrak provides all attributes; DataTrak only provides those that need updating)
          'code',
          'id',
          'name',
          'type',
          'project_id',
          // updateOrCreate doesn’t deeply merge JSONB attributes, so do it here
          'metadata',
        ],
      });

      const entityToUpsert = existingEntity
        ? toMerged(existingEntity, entityWithResolvedIds)
        : entityWithResolvedIds;
      return { resolvedId, entityToUpsert };
    }),
  );

  // Phase 2 — upsert parent-before-child (sequentially) so each child's parent_id FK is satisfied.
  const results = [];
  for (const { resolvedId, entityToUpsert } of orderEntitiesParentFirst(resolvedEntities)) {
    results.push(await models.entity.updateOrCreate({ id: resolvedId }, entityToUpsert));
  }
  return results;
};

/**
 * @param {import('@tupaia/database').ModelRegistry} models
 * @param {SurveyResponse['options_created']} optionsCreated
 * @returns {Promise<OptionRecord[]>}
 */
const createOptions = async (models, optionsCreated) => {
  /** @type {OptionRecord[]} */
  const options = [];
  for (const optionObject of optionsCreated) {
    const { value, option_set_id: optionSetId } = optionObject;
    // Exclude `id` from the fields passed to updateOrCreate. The conflict target is
    // (option_set_id, value), so when a matching option already exists the ON CONFLICT
    // DO UPDATE fires. Including `id` in the update data would change the existing
    // option's primary key via UPDATE (not DELETE+INSERT), which means the BEFORE DELETE
    // trigger on the option table never fires and the old sync_lookup entry is orphaned
    // with is_deleted = FALSE, causing duplicates.
    const { id: _id, ...fieldsWithoutId } = optionObject;

    /** @type {number} */
    const maxSortOrder = (await models.option.getLargestSortOrder(optionSetId)) ?? 0;

    /** @type {OptionRecord} */
    const optionRecord = await models.option.updateOrCreate(
      { option_set_id: optionSetId, value },
      {
        ...fieldsWithoutId,
        sort_order: maxSortOrder + 1,
        attributes: {},
      },
    );

    options.push(optionRecord);
  }

  return options;
};

/**
 * Upsert entities and options that were created in user's local database.
 *
 * @param {ModelRegistry} models
 * @param {SurveyResponse[]} surveyResponses
 * @param {{ resolveEntityId?: ResolveEntityId, projectId?: string }} [options]
 *   `resolveEntityId` is used by the MediTrak sync path to translate canonical
 *   entity ids into project-specific row ids (lazy-duplicating where needed).
 *   `projectId` is the survey's project — passed to the resolver. Both must
 *   be supplied together or both omitted.
 */
export const upsertEntitiesAndOptions = async (
  models,
  surveyResponses,
  { resolveEntityId, projectId } = {},
) => {
  for (const surveyResponse of surveyResponses) {
    const entitiesUpserted = surveyResponse.entities_upserted || [];
    const optionsCreated = surveyResponse.options_created || [];

    try {
      if (entitiesUpserted.length > 0) {
        await upsertEntities(models, entitiesUpserted, { resolveEntityId, projectId });
      }
    } catch (error) {
      winston.error(
        `Error upserting entities from survey response ${surveyResponse.id} for survey ${surveyResponse.survey_id}`,
      );
      throw error;
    }

    try {
      if (optionsCreated.length > 0) {
        await createOptions(models, optionsCreated);
      }
    } catch (error) {
      winston.error(
        `Error creating options from survey response ${surveyResponse.id} for survey ${surveyResponse.survey_id}`,
      );
      throw error;
    }
  }
};
