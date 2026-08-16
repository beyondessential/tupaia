'use strict';

/**
 * Deduplicate data_element rows that share a code so the unique constraint in
 * 20260807082500-AddHotPathPerformanceIndexes can be created.
 *
 * Keeps MIN(id) for determinism.
 */
exports.up = async function (db) {
  // NB:
  //   - `data_element_data_group` enforces unique (data_element_id, data_group_id) pairs
  //   - `data_element_data_group.data_element_id` references `data_element.id`
  //   - `question.data_element_id` references `data_element.id`
  //
  // As of writing this migration, none of the above constraints will be violated in production
  // databases by the deduplication query below. Hence, this migration assumes “clean” data in
  // `data_element_data_group` and `question`.

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
