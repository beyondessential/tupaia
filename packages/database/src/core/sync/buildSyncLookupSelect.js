import { COLUMNS_EXCLUDED_FROM_SYNC } from '@tupaia/constants';

export async function buildSyncLookupSelect(model, columns = {}) {
  const attributes = Object.keys(await model.fetchSchema());
  const { projectIds } = columns;
  const table = model.databaseRecord;
  const excludedFields = [...(model.excludedFieldsFromSync || []), ...COLUMNS_EXCLUDED_FROM_SYNC];

  return `
    SELECT
      ${table}.id,
      '${table}',
      COALESCE(:updatedAtSyncTick, ${table}.updated_at_sync_tick),
      sync_device_tick.device_id,
      json_build_object(
        ${attributes.filter(a => !excludedFields.includes(a)).map(a => `'${a}', ${table}.${a}`)}
      ),
      ${projectIds || 'NULL'}
  `;
}
