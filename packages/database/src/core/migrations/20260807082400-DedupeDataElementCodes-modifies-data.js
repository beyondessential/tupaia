'use strict';

/**
 * Deduplicate data_element rows that share a code so the unique index in
 * 20260807082500-AddHotPathPerformanceIndexes can be created.
 *
 * Deterministic keep rule: for each duplicated code, keep MIN(id) and discard every other row.
 * Join-row collisions under (data_element_id, data_group_id) are resolved the same way — keep
 * MIN(data_element_data_group.id).
 */
exports.up = async function (db) {
  // `data_element_data_group` enforces unique (data_element_id, data_group_id) pairs. (As of
  // writing this migration, this affects 0 rows. Just being safe.)
  await db.runSql(`
    DELETE FROM data_element_data_group
    WHERE id IN (
      WITH keepers AS (
        SELECT code, MIN(id) AS keep_id
        FROM data_element
        GROUP BY code
        HAVING COUNT(*) > 1
      ),
      remapped_joins AS (
        SELECT
          dedg.id AS join_id,
          ROW_NUMBER() OVER (
            PARTITION BY keepers.keep_id, dedg.data_group_id
            ORDER BY dedg.id
          ) AS rn
        FROM data_element_data_group dedg
        JOIN data_element de ON de.id = dedg.data_element_id
        JOIN keepers ON keepers.code = de.code
      )
      SELECT join_id FROM remapped_joins WHERE rn > 1
    );
  `);

  // `data_element_data_group.data_element_id` references `data_element.id`. (As of writing this
  // migration, this affects 0 rows. Just being safe.)
  await db.runSql(`
    WITH keepers AS (
      SELECT code, MIN(id) AS keep_id
      FROM data_element
      GROUP BY code
      HAVING COUNT(*) > 1
    )
    UPDATE data_element_data_group dedg
    SET data_element_id = keepers.keep_id
    FROM data_element de
    JOIN keepers ON keepers.code = de.code
    WHERE dedg.data_element_id = de.id
      AND de.id <> keepers.keep_id;
  `);

  // `question.data_element_id` references `data_element.id`. (As of writing this migration, this
  // affects 0 rows. Just being safe.)
  await db.runSql(`
    WITH keepers AS (
      SELECT code, MIN(id) AS keep_id
      FROM data_element
      GROUP BY code
      HAVING COUNT(*) > 1
    )
    UPDATE question q
    SET data_element_id = keepers.keep_id
    FROM data_element de
    JOIN keepers ON keepers.code = de.code
    WHERE q.data_element_id = de.id
      AND de.id <> keepers.keep_id;
  `);

  // Delete duplicates
  await db.runSql(`
    WITH keepers AS (
      SELECT code, MIN(id) AS keep_id
      FROM data_element
      GROUP BY code
      HAVING COUNT(*) > 1
    )
    DELETE FROM data_element de
    USING keepers
    WHERE de.code = keepers.code
      AND de.id <> keepers.keep_id;
  `);
};

/** Irreversible: discarded duplicate rows are not reconstructed. */
exports.down = async function () {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
