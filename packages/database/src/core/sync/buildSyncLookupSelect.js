import { COLUMNS_EXCLUDED_FROM_SYNC } from '@tupaia/constants';

export async function buildSyncLookupSelect(model, columns = {}) {
  const attributes = Object.keys(await model.fetchSchema());
  const { projectIds, extraData } = columns;
  const table = model.databaseRecord;
  const excludedFields = [...(model.excludedFieldsFromSync || []), ...COLUMNS_EXCLUDED_FROM_SYNC];

  // `extraData` lets a model add computed (non-column) fields to the synced blob,
  // e.g. `{ duplicate_ids: 'array_remove(array_agg(...), NULL)' }`.
  const dataFields = [
    ...attributes.filter(a => !excludedFields.includes(a)).map(a => `'${a}', ${table}.${a}`),
    ...Object.entries(extraData || {}).map(([key, expression]) => `'${key}', ${expression}`),
  ];

  return `
    SELECT
      ${table}.id,
      '${table}',
      COALESCE(:updatedAtSyncTick, ${table}.updated_at_sync_tick),
      sync_device_tick.device_id,
      json_build_object(
        ${dataFields}
      ),
      ${projectIds || 'NULL'}
  `;
}
