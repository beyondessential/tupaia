import { buildSyncLookupSurveyProjectIdSelect } from './buildSyncLookupUtils';

export async function buildProjectLinkedLookupQueryDetails(model) {
  return {
    select: await buildSyncLookupSurveyProjectIdSelect(model),
  };
}
