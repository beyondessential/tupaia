import { snake } from 'case';
import { DatabaseModel } from '@tupaia/database';
import { COLUMNS_EXCLUDED_FROM_SYNC } from '@tupaia/sync';
interface Columns {
  projectIds?: string;
}

export async function buildSyncLookupSelect(model: DatabaseModel, columns: Columns = {}) {
  const attributes = await model.fetchFieldNames();
  const { projectIds } = columns;
  const table = model.databaseRecord;

  console.log('attributessss', attributes);
  return `
    SELECT
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
