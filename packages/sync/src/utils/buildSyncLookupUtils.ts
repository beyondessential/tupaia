import { DatabaseModel } from '@tupaia/database';

import { buildSyncLookupSelect } from './buildSyncLookupSelect';

export const buildSyncLookupSurveyProjectIdSelect = async (model: DatabaseModel) =>
  buildSyncLookupSelect(model, {
    projectIds: `ARRAY[survey.project_id]`,
  });
