import { DatabaseModel } from '@tupaia/database';

import { buildSyncLookupSurveyProjectIdSelect } from './buildSyncLookupUtils';

export async function buildProjectLinkedLookupQueryDetails(model: DatabaseModel) {
  return {
    select: await buildSyncLookupSurveyProjectIdSelect(model),
  };
}
