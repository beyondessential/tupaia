import { DatabaseModel } from '@tupaia/database';
import { COLUMNS_EXCLUDED_FROM_SYNC } from '../constants';
interface Columns {
  projectIds?: string;
}

export async function buildSyncLookupSelect(model: DatabaseModel, columns: Columns = {}) {
  const attributes = await model.fetchFieldNames();
  const { projectIds } = columns;
  const table = model.databaseRecord;

  return `
    SELECT DISTINCT ON (
      ${table}.id
    )
    ${table}.id,
    '${table}',
    COALESCE(:updatedAtSyncTick, ${table}.updated_at_sync_tick),
    sync_device_ticks.device_id,
    json_build_object(
      ${attributes
        .filter(a => !COLUMNS_EXCLUDED_FROM_SYNC.includes(a))
        .map(a => `'${a}', ${table}.${a}`)}
    ),
    ${projectIds || 'NULL'}
  `;
}
