"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const QUESTION_TYPES = [
  'Arithmetic',
  'Autocomplete',
  'Binary',
  'Checkbox',
  'CodeGenerator',
  'Condition',
  'Date',
  'DateOfData',
  'DateTime',
  'Entity',
  'FreeText',
  'Geolocate',
  'Instruction',
  'Number',
  'Photo',
  'PrimaryEntity',
  'Radio',
  'SubmissionDate'
];

exports.up = async function(db) {
  // Simply casting type to question_type fails for some reason, have to do it in this roundabout way
  await db.runSql(`
    CREATE TYPE question_type AS ENUM ('${QUESTION_TYPES.join('\', \'')}');
    ALTER TABLE question ADD COLUMN type2 question_type;
    UPDATE question SET type2 = cast(type as question_type);
    ALTER TABLE question DROP COLUMN type;
    ALTER TABLE question RENAME COLUMN type2 TO type;
    ALTER TABLE question ALTER COLUMN type SET NOT NULL;
  `);
};

exports.down = async function(db) {
  await db.runSql(`ALTER TABLE question ALTER COLUMN "type" TYPE TEXT, ALTER COLUMN "type" SET NOT NULL;`);
  await db.runSql(`DROP TYPE question_type;`);
};

exports._meta = {
  "version": 1
};
