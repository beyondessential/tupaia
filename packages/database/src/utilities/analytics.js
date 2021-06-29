/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

// Performs a full refresh
// Use this after large migrations, they overload the auto fast refresh
export const runFullAnalyticsRefresh = async db => {
  await db.runSql(`
    SELECT mv$removeIndexFromMv$Table(mv$buildAllConstants(), 'analytics_data_element_entity_date_idx');
    SELECT mv$removeIndexFromMv$Table(mv$buildAllConstants(), 'analytics_data_group_entity_event_date_idx');
    SELECT mv$refreshMaterializedView('analytics', 'public');
    SELECT mv$addIndexToMv$Table(mv$buildAllConstants(), 'public', 'analytics', 'analytics_data_element_entity_date_idx', 'data_element_code, entity_code, date desc');
    SELECT mv$addIndexToMv$Table(mv$buildAllConstants(), 'public', 'analytics', 'analytics_data_group_entity_event_date_idx', 'data_group_code, entity_code, event_id, date desc');
  `);
};
