import winston from 'winston';

import { AnalyticsRefresher } from '@tupaia/database';
import { respond, ValidationError } from '@tupaia/utils';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { ACTIONS, CHANGE_HANDLERS } from './changeHandlers';

// TODO: Tidy this up as part of RN-502

/**
 * Responds to POST requests to the /changes endpoint, integrating the data posted in the request
 * body according to the action types causing the changes
 * @param {object}  event    - event data (e.g. url, query parameters, body)
 * @param {object}  context  - runtime info (Lambda metadata)
 * @param {func}    res - function to call with response, takes (Error error, Object result)
 */
export async function postChanges(req, res) {
  const changes = req.body;
  if (!Array.isArray(changes)) {
    throw new ValidationError('Request body must be an array of changes');
  }
  const translatedChanges = [];

  await req.models.wrapInTransaction(async transactingModels => {
    for (const change of changes) {
      const { action, payload, ...rest } = change ?? {};
      const changeHandler = CHANGE_HANDLERS.get(action);
      if (changeHandler === undefined) {
        throw new ValidationError(`${action} is not a supported change action`);
      }
      const { translate, validate, handle } = changeHandler;
      const translatedPayload = await translate(transactingModels, payload);
      await validate(transactingModels, translatedPayload);
      translatedChanges.push({ ...rest, action, translatedPayload, handle });
    }

    // A response can reference an entity that has since been hard-deleted on central (e.g. a
    // device that submitted against a canonical entity before pulling the delete-swap). Both
    // the permission check and the resolver throw on the missing id, and as the whole batch
    // commits in one transaction that would roll back every other change and wedge the sync.
    // Quarantine those responses so the rest of the batch still commits.
    const { processableChanges, quarantinedResponses } = await partitionResolvableChanges(
      transactingModels,
      translatedChanges,
    );
    for (const surveyResponse of quarantinedResponses) {
      winston.warn(
        `Skipping MediTrak survey response ${surveyResponse.id}: referenced entity ` +
          `${surveyResponse.entity_id ?? surveyResponse.clinic_id} no longer exists ` +
          `(likely a deleted canonical entity). Committing the rest of the sync batch.`,
      );
    }

    // Check permissions for survey responses
    const surveyResponsePayloads = processableChanges
      .filter(c => c.action === ACTIONS.SubmitSurveyResponse)
      .map(c => c.translatedPayload.survey_response || c.translatedPayload);
    const surveyResponsePermissionsChecker = async accessPolicy => {
      await transactingModels.surveyResponse.assertCanSubmit(
        transactingModels,
        accessPolicy,
        surveyResponsePayloads,
      );
    };
    await req.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponsePermissionsChecker]),
    );

    for (const { action, translatedPayload, handle, ...rest } of processableChanges) {
      await handle(transactingModels, translatedPayload);

      if (action === ACTIONS.SubmitSurveyResponse) {
        // TODO: Rework this functionality, as directly calling an analytics refresh here is both inefficient
        // and may create duplicate records in the analytics table
        const { waitForAnalyticsRebuild } = rest;
        if (waitForAnalyticsRebuild) {
          const { database } = transactingModels;
          await AnalyticsRefresher.refreshAnalytics(database);
        }
      }
    }
  });

  respond(res, { message: 'Successfully integrated changes into server database' });
}

const getSurveyResponse = change => change.translatedPayload.survey_response || change.translatedPayload;

/**
 * Splits SubmitSurveyResponse changes whose referenced entity can't be resolved out of the
 * batch, so a single orphaned reference can't roll back everyone else's changes. Existence is
 * looked up once per model (not once per response). A quarantined response's entities_upserted
 * never land, so dropping one can cascade to responses that depend on it — resolvability is
 * settled to a fixed point.
 */
async function partitionResolvableChanges(models, translatedChanges) {
  const responseChanges = translatedChanges.filter(c => c.action === ACTIONS.SubmitSurveyResponse);
  const entityIds = uniqueTruthy(responseChanges.map(c => getSurveyResponse(c).entity_id));
  const clinicIds = uniqueTruthy(responseChanges.map(c => getSurveyResponse(c).clinic_id));
  const existingEntityIds = new Set(
    entityIds.length ? (await models.entity.findManyById(entityIds)).map(e => e.id) : [],
  );
  const existingClinicIds = new Set(
    clinicIds.length ? (await models.facility.findManyById(clinicIds)).map(f => f.id) : [],
  );

  const processable = new Set(responseChanges);
  let settled = false;
  while (!settled) {
    settled = true;
    // Only entities created by responses that are still in the batch are guaranteed to land.
    const createdEntityIds = new Set(
      [...processable].flatMap(c => (getSurveyResponse(c).entities_upserted || []).map(e => e.id)),
    );
    for (const change of [...processable]) {
      if (!resolvesEntity(getSurveyResponse(change), existingEntityIds, existingClinicIds, createdEntityIds)) {
        processable.delete(change);
        settled = false;
      }
    }
  }

  const quarantinedResponses = responseChanges
    .filter(c => !processable.has(c))
    .map(getSurveyResponse);
  const processableChanges = translatedChanges.filter(
    c => c.action !== ACTIONS.SubmitSurveyResponse || processable.has(c),
  );
  return { processableChanges, quarantinedResponses };
}

// Mirrors how SurveyResponse.assertCanSubmit resolves a response's entity: an entity created by
// a response still in the batch is fine even before it exists in the db; otherwise the
// referenced entity (or legacy clinic) must exist.
const resolvesEntity = (surveyResponse, existingEntityIds, existingClinicIds, createdEntityIds) => {
  const { entity_code: entityCode, entity_id: entityId, clinic_id: clinicId } = surveyResponse;
  if (entityCode) return true;
  if (entityId) return createdEntityIds.has(entityId) || existingEntityIds.has(entityId);
  if (clinicId) return existingClinicIds.has(clinicId);
  return true;
};

const uniqueTruthy = values => [...new Set(values.filter(Boolean))];
