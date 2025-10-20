'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await db.runSql(`
    BEGIN;

    -- Delete duplicates to ensure (option_set_id, TRIM(value)) is unique
    WITH "duplicates" AS (
      SELECT "id",
             ROW_NUMBER() OVER (
               PARTITION BY "option_set_id", TRIM("value")
               ORDER BY     "id"
             ) > 1 AS "is_duplicate"
      FROM   "option"
    )
    DELETE FROM "option"
    WHERE "id" IN (
      SELECT "id"
      FROM   "duplicates"
      WHERE  "is_duplicate" IS TRUE
    );
    COMMIT;

    -- Trim option.value values
    UPDATE "option"
    SET    "value" = TRIM("value")
    WHERE  "value" <> TRIM("value");

    -- Update answer.text values to reflect trimmed option.value values
    UPDATE "answer"
    SET    "text"
    WHERE  "type" = 'Autocomplete' AND "text" <> TRIM("text");

    COMMIT;
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
