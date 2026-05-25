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

const upsertEntities = async (models, entitiesUpserted, { resolveEntityId, projectId } = {}) => {
  return await Promise.all(
    entitiesUpserted.map(async entity => {
      // For MediTrak-style payloads (canonical id), translate both the entity
      // id and its parent_id into project-specific rows via the resolver.
      // Datatrak skips this — its ids are already project-specific.
      let resolvedId = entity.id;
      let resolvedParentId = entity.parent_id;
      if (resolveEntityId && projectId) {
        resolvedId = await resolveEntityId({ canonicalEntityId: entity.id, projectId });
        if (entity.parent_id) {
          resolvedParentId = await resolveEntityId({
            canonicalEntityId: entity.parent_id,
            projectId,
          });
        }
      }

      const entityWithResolvedIds = {
        ...entity,
        id: resolvedId,
        ...(entity.parent_id ? { parent_id: resolvedParentId } : {}),
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
          // updateOrCreate doesn’t deeply merge JSONB attributes, so do it here
          'metadata',
        ],
      });

      const entityToUpsert = existingEntity
        ? toMerged(existingEntity, entityWithResolvedIds)
        : entityWithResolvedIds;
      return await models.entity.updateOrCreate({ id: resolvedId }, entityToUpsert);
    }),
  );
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
