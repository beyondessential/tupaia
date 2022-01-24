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
  // Disable survey_response analytics table trigger
  await db.runSql(`ALTER TABLE survey_response DISABLE TRIGGER "trig$_survey_response"`);

  await db.runSql(
    `CREATE TYPE approval_status AS ENUM('not_required', 'pending', 'rejected', 'approved')`,
  );
  await db.addColumn('survey_response', 'approval_status', {
    type: 'approval_status',
    defaultValue: 'not_required',
  });
  await db.addColumn('survey', 'requires_approval', {
    type: 'boolean',
    defaultValue: 'false',
  });

  // Enable trigger again
  await db.runSql('ALTER TABLE survey_response ENABLE TRIGGER "trig$_survey_response"');
};

exports.down = async function (db) {
  await db.removeColumn('survey_response', 'approval_status');
  await db.removeColumn('survey', 'requires_approval');
  await db.runSql('DROP TYPE approval_status');
};

exports._meta = {
  version: 1,
};
