import momentTimezone from 'moment-timezone';

import { SurveyResponseModel } from '@tupaia/database';
import { QuestionType } from '@tupaia/types';
import {
  DatabaseError,
  reformatDateStringWithoutTz,
  stripTimezoneFromDate,
  ValidationError,
} from '@tupaia/utils';
import { ANSWER_BODY_PARSERS } from '../../../dataAccessors';
import { DEFAULT_DATABASE_TIMEZONE, getEntityIdFromClinicId } from '../../../database';
import { createCachedEntityResolver } from './resolveCanonicalEntityForProject';

// Answer types that carry an entity id in their `body` / `text`. MediTrak
// holds canonical ids; we translate to project-specific ids before saving so
// downstream consumers (analytics, datatrak) see the right row.
const ENTITY_ANSWER_TYPES = new Set([QuestionType.Entity, QuestionType.PrimaryEntity]);

const translateEntityAnswerBodies = async (answers, resolveEntityId, projectId) => {
  if (!answers || answers.length === 0 || !resolveEntityId) return answers;

  return Promise.all(
    answers.map(async answer => {
      if (!ENTITY_ANSWER_TYPES.has(answer.type) || !answer.body) return answer;
      const projectSpecificId = await resolveEntityId({ canonicalEntityId: answer.body, projectId });
      return { ...answer, body: projectSpecificId };
    }),
  );
};

/**
 * Creates or updates survey responses from passed changes
 */
export async function updateOrCreateSurveyResponse(models, surveyResponseObject) {
  const {
    id: surveyResponseId,
    answers,
    clinic_id: clinicId,
    ...surveyResponseProperties
  } = surveyResponseObject;

  try {
    await models.wrapInTransaction(async transactingModels => {
      const survey = await transactingModels.survey.findById(surveyResponseObject.survey_id);
      const projectId = survey?.project_id ?? null;

      // For MediTrak payloads the entity ids in entities_upserted (and their
      // parent_ids), the answer bodies, and the response's own entity_id are
      // canonical. Translate them to project-specific row ids via the survey's
      // project, lazy-duplicating where no project-specific row exists. One
      // cached resolver is shared across all of these so each canonical id is
      // resolved (and lazy-duplicated) at most once per submission. Skipping
      // the resolver entirely when projectId is null preserves pre-epic
      // behaviour for any survey without a project.
      const resolveEntityId = projectId ? createCachedEntityResolver(transactingModels) : null;
      const upsertOptions = resolveEntityId ? { projectId, resolveEntityId } : undefined;
      await SurveyResponseModel.upsertEntitiesAndOptions(
        transactingModels,
        [surveyResponseObject],
        upsertOptions,
      );

      // Ensure entity_id is populated, supporting legacy versions of MediTrak.
      // The clinic_id path is the legacy one and is already project-aware;
      // modern clients send entity_id directly (canonical), so translate it to
      // the project-specific row the same way as answers and entities_upserted.
      if (clinicId) {
        const entityId = await getEntityIdFromClinicId(transactingModels, clinicId, projectId);
        surveyResponseProperties.entity_id = entityId;
      } else if (resolveEntityId && surveyResponseProperties.entity_id) {
        surveyResponseProperties.entity_id = await resolveEntityId({
          canonicalEntityId: surveyResponseProperties.entity_id,
          projectId,
        });
      }

      // Ensure data_time is populated, supporting legacy versions of MediTrak
      surveyResponseProperties.data_time = getDataTime(surveyResponseObject);

      // If the response is for a survey where approval is required, set approval to pending
      const approvalStatus = survey.requires_approval
        ? transactingModels.surveyResponse.approvalStatusTypes.PENDING
        : transactingModels.surveyResponse.approvalStatusTypes.NOT_REQUIRED;

      const surveyResponse = await transactingModels.surveyResponse.updateOrCreate(
        { id: surveyResponseId },
        {
          id: surveyResponseId,
          approval_status: approvalStatus,
          ...surveyResponseProperties,
        },
      );

      // Entity/PrimaryEntity question answers carry canonical entity ids in
      // their body — translate to project-specific ids before saving.
      const translatedAnswers = await translateEntityAnswerBodies(
        answers,
        resolveEntityId,
        projectId,
      );

      await SurveyResponseModel.upsertAnswers(
        transactingModels,
        translatedAnswers,
        surveyResponse.id,
        ANSWER_BODY_PARSERS,
      );
    });
  } catch (error) {
    throw new DatabaseError(`creating/updating survey response with ID ${surveyResponseId}`, error);
  }
}

/**
 * @param surveyResponseObject
 * @return {string}
 * @throws ValidationError
 */
const getDataTime = surveyResponseObject => {
  const {
    data_time: suppliedDataTime,
    submission_time: submissionTime, // v1.7.87 to v1.9.110 (inclusive) uses submission_time
    end_time: endTime, // prior to v1.7.87 fall back to end_time
    timezone: suppliedTimezone,
  } = surveyResponseObject;

  if (suppliedDataTime) {
    if (suppliedTimezone) {
      // Timezone specified, strip it
      return stripTimezoneFromDate(momentTimezone(suppliedDataTime).tz(suppliedTimezone).format());
    }

    // No timezone specified. We are submitting the data_time explicitly without a tz.
    //
    // If the input is in a known format like ISO8601 without tz, we can use this directly, we just
    // reformat it into our specific format without tz.
    const reformattedDataTime = reformatDateStringWithoutTz(suppliedDataTime);
    if (reformattedDataTime) {
      return reformattedDataTime;
    }
    throw new ValidationError(
      `Unable to parse data_time ${suppliedDataTime} against known formats without timezone. Either use a known format or specify a timezone.`,
    );
  }

  // Fallback for older versions
  const dataTime = submissionTime || endTime;

  const timezone = suppliedTimezone || DEFAULT_DATABASE_TIMEZONE; // if no timezone provided, use db default

  // Convert to the original timezone, then strip timezone suffix, so it ends up in db as it
  // appeared to the original survey submitter
  return stripTimezoneFromDate(momentTimezone(dataTime).tz(timezone).format());
};
