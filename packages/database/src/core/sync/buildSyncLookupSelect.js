import { COLUMNS_EXCLUDED_FROM_SYNC } from '@tupaia/constants';

export async function buildSyncLookupSelect(model, columns = {}) {
  const attributes = Object.keys(await model.fetchSchema());
  const { projectIds } = columns;
  const table = model.databaseRecord;

  return `
    SELECT
      ${table}.id,
      '${table}',
      COALESCE(:updatedAtSyncTick, ${table}.updated_at_sync_tick),
      sync_device_tick.device_id,
      json_build_object(
        ${attributes
          .filter(a => !COLUMNS_EXCLUDED_FROM_SYNC.includes(a))
          .map(a => `'${a}', ${table}.${a}`)}
      ),
      ${projectIds || 'NULL'}
  `;
}
