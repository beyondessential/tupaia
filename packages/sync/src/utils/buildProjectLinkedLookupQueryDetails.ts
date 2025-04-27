import { DatabaseModel } from '@tupaia/database';
import { buildSyncLookupSelect } from './buildSyncLookupSelect';

export async function buildProjectLinkedLookupQueryDetails(model: DatabaseModel) {
  return {
    select: await buildSyncLookupSelect(model, {
      projectIds: `ARRAY[${model.databaseRecord}.project_id]`,
    }),
  };
}
