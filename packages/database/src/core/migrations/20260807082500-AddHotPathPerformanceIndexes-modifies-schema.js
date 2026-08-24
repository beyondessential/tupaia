'use strict';

exports.up = async function (db) {
  // Unique attributes that should always have been enforced
  await db.runSql(`
    ALTER TABLE data_element ADD CONSTRAINT data_element_code_key UNIQUE (code);
    ALTER TABLE data_group ADD CONSTRAINT data_group_code_key UNIQUE (code);
  `);

  // Hierarchy walks (entity-server, web-config-server, report aggregation) always filter
  // ancestor_descendant_relation by entity_hierarchy_id alongside ancestor_id/descendant_id,
  // and often generational_distance. The existing single-column indexes can't serve
  // hierarchy-scoped scans (e.g. entity search, child/parent code maps).
  await db.runSql(`
    CREATE INDEX IF NOT EXISTS ancestor_descendant_relation_hierarchy_ancestor_idx
      ON ancestor_descendant_relation (entity_hierarchy_id, ancestor_id, generational_distance);
    CREATE INDEX IF NOT EXISTS ancestor_descendant_relation_hierarchy_descendant_idx
      ON ancestor_descendant_relation (entity_hierarchy_id, descendant_id, generational_distance);
  `);

  // The sync-server snapshot query filters updated_at_sync_tick with a btree-unusable
  // array-overlap (&&) on project_ids. Replace the composite (whose second column is dead
  // weight) with a plain tick btree, plus a GIN for initial syncs where the tick filter
  // is unselective.
  await db.runSql(`
    DROP INDEX IF EXISTS sync_lookup_updated_at_sync_tick_project_ids_index;
    CREATE INDEX IF NOT EXISTS sync_lookup_updated_at_sync_tick_idx
      ON sync_lookup (updated_at_sync_tick);
    CREATE INDEX IF NOT EXISTS sync_lookup_project_ids_gin_idx
      ON sync_lookup USING gin (project_ids);
  `);

  // The DataTrak activity feed orders by creation_date with pagination and left-joins
  // survey_response on record_id; feed_item has no secondary indexes and grows per response.
  await db.runSql(`
    CREATE INDEX IF NOT EXISTS feed_item_creation_date_idx ON feed_item (creation_date DESC);
    CREATE INDEX IF NOT EXISTS feed_item_record_id_idx ON feed_item (record_id);
  `);

  // The legacy MediTrak count handler selects from the very large, insert-heavy
  // api_request_log by refresh_token, which is unindexed. Partial index keeps maintenance
  // cost down since most requests log a NULL refresh_token.
  await db.runSql(`
    CREATE INDEX IF NOT EXISTS api_request_log_refresh_token_idx
      ON api_request_log (refresh_token)
      WHERE refresh_token IS NOT NULL;
  `);

  // Small relation tables on hot paths (/projects, /dashboards, /measures) with primary
  // keys only. Low impact today, but removes a scaling cliff at negligible cost.
  await db.runSql(`
    CREATE INDEX IF NOT EXISTS entity_relation_hierarchy_parent_idx
      ON entity_relation (entity_hierarchy_id, parent_id);
    CREATE INDEX IF NOT EXISTS dashboard_relation_dashboard_id_idx
      ON dashboard_relation (dashboard_id);
    CREATE INDEX IF NOT EXISTS map_overlay_group_relation_map_overlay_group_id_idx
      ON map_overlay_group_relation (map_overlay_group_id);
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    ALTER TABLE data_element DROP CONSTRAINT IF EXISTS data_element_code_key;
    ALTER TABLE data_group DROP CONSTRAINT IF EXISTS data_group_code_key;
    ALTER TABLE map_overlay DROP CONSTRAINT IF EXISTS map_overlay_code_key;

    DROP INDEX IF EXISTS ancestor_descendant_relation_hierarchy_ancestor_idx;
    DROP INDEX IF EXISTS ancestor_descendant_relation_hierarchy_descendant_idx;

    DROP INDEX IF EXISTS sync_lookup_updated_at_sync_tick_idx;
    DROP INDEX IF EXISTS sync_lookup_project_ids_gin_idx;
    CREATE INDEX IF NOT EXISTS sync_lookup_updated_at_sync_tick_project_ids_index
      ON sync_lookup (updated_at_sync_tick, project_ids);

    DROP INDEX IF EXISTS feed_item_creation_date_idx;
    DROP INDEX IF EXISTS feed_item_record_id_idx;

    DROP INDEX IF EXISTS api_request_log_refresh_token_idx;

    DROP INDEX IF EXISTS entity_relation_hierarchy_parent_idx;
    DROP INDEX IF EXISTS dashboard_relation_dashboard_id_idx;
    DROP INDEX IF EXISTS map_overlay_group_relation_map_overlay_group_id_idx;
  `);
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
