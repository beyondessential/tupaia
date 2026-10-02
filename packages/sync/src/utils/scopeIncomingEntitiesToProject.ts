import type { ModelRegistry, TupaiaDatabase } from '@tupaia/database';

import { SYNC_SESSION_DIRECTION } from '../constants';
import type { SyncSnapshotAttributes } from '../types';
import { findSyncSnapshotRecords } from './findSyncSnapshotRecords';
import { updateSnapshotRecords } from './manageSnapshotTable';

// Shared/structural entity types are project-agnostic (project_id IS NULL); every other type
// must carry a project_id. Mirrors the `entity_project_id_check` DB constraint.
const STRUCTURAL_ENTITY_TYPES = new Set(['world', 'project', 'country']);

type IncomingEntityData = { id?: string; type?: string; project_id?: string | null };

const needsProjectScope = (data: SyncSnapshotAttributes['data']): boolean => {
  const entity = data as IncomingEntityData;
  return !!entity && entity.project_id == null && !STRUCTURAL_ENTITY_TYPES.has(entity.type ?? '');
};

/**
 * Fill `project_id` on incoming (pushed) `entity` records a client sent with `project_id: null`,
 * before the incoming snapshot is persisted.
 *
 * Per-project entity duplication requires every sub-country entity to carry a project_id
 * (`entity_project_id_check`). A pre-epic client — or any client whose local entities predate the
 * reshape — pushes such entities with `project_id: null`. Persisting that verbatim violates the
 * constraint and, because the incoming batch is applied all-or-nothing, wedges the entire sync —
 * which is exactly what stops the forced upgrade re-sync from ever completing (data is preserved
 * client-side by the deferral, but the device can never finish upgrading).
 *
 * Resolution:
 *   - entity already exists → keep its current project_id (never overwrite a valid scope with
 *                             null);
 *   - new entity            → derive it from the survey_response referencing the entity in this
 *                             same push (survey_response.entity_id → survey.project_id).
 *
 * Central-server sync-up only. Records that can't be resolved are left untouched — they surface
 * the constraint error rather than being silently dropped, since the referencing survey_response
 * FK-references them (dropping the entity would only move the failure).
 */
export const scopeIncomingEntitiesToProject = async (
  database: TupaiaDatabase,
  models: ModelRegistry,
  sessionId: string,
): Promise<void> => {
  const entityRecords = await findSyncSnapshotRecords(
    database,
    sessionId,
    undefined,
    undefined,
    'entity',
    SYNC_SESSION_DIRECTION.INCOMING,
    'is_deleted IS FALSE',
  );

  const unscopedRecords = entityRecords.filter(record => needsProjectScope(record.data));
  if (unscopedRecords.length === 0) return;

  const entityIds = unscopedRecords
    .map(record => (record.data as IncomingEntityData).id)
    .filter((id): id is string => !!id);
  const projectIdByEntityId = new Map<string, string>();

  // 1. Existing entities: keep their current project_id rather than nulling it.
  const existingEntities = (await models
    .getModelForDatabaseRecord('entity')
    .find({ id: entityIds }, { columns: ['id', 'project_id'] })) as {
    id: string;
    project_id: string | null;
  }[];
  for (const entity of existingEntities) {
    if (entity.project_id) projectIdByEntityId.set(entity.id, entity.project_id);
  }

  // 2. New entities: derive the project from the survey_response referencing them in this push.
  const unresolvedEntityIds = new Set(entityIds.filter(id => !projectIdByEntityId.has(id)));
  if (unresolvedEntityIds.size > 0) {
    const surveyResponseRecords = await findSyncSnapshotRecords(
      database,
      sessionId,
      undefined,
      undefined,
      'survey_response',
      SYNC_SESSION_DIRECTION.INCOMING,
      'is_deleted IS FALSE',
    );
    const surveyIdByEntityId = new Map<string, string>();
    for (const { data } of surveyResponseRecords) {
      const { entity_id: entityId, survey_id: surveyId } = data as {
        entity_id?: string;
        survey_id?: string;
      };
      if (entityId && surveyId && unresolvedEntityIds.has(entityId)) {
        surveyIdByEntityId.set(entityId, surveyId);
      }
    }
    const surveyIds = [...new Set(surveyIdByEntityId.values())];
    if (surveyIds.length > 0) {
      const surveys = (await models
        .getModelForDatabaseRecord('survey')
        .find({ id: surveyIds }, { columns: ['id', 'project_id'] })) as {
        id: string;
        project_id: string;
      }[];
      const projectIdBySurveyId = new Map(surveys.map(survey => [survey.id, survey.project_id]));
      for (const [entityId, surveyId] of surveyIdByEntityId) {
        const projectId = projectIdBySurveyId.get(surveyId);
        if (projectId) projectIdByEntityId.set(entityId, projectId);
      }
    }
  }

  if (projectIdByEntityId.size === 0) return;

  // Write the resolved project_id back onto the snapshot so the persist step applies a valid
  // scope. `requiresRepull` propagates the corrected entity back to devices. `data` is stringified
  // to match how snapshot records are persisted (the JSONB column is written as JSON text, not a
  // raw object) — this also avoids snakeKeys recursing into the record's own keys.
  for (const record of unscopedRecords) {
    const projectId = projectIdByEntityId.get((record.data as IncomingEntityData).id ?? '');
    if (!projectId) continue;
    await updateSnapshotRecords(
      database,
      sessionId,
      {
        data: JSON.stringify({ ...record.data, project_id: projectId }),
        requiresRepull: true,
      },
      { id: record.id },
    );
  }
};
