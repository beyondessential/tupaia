import { buildSyncLookupSelect } from './buildSyncLookupSelect';

export const buildSyncLookupSurveyProjectIdSelect = async model =>
  buildSyncLookupSelect(model, {
    projectIds: `ARRAY[survey.project_id]`,
  });
