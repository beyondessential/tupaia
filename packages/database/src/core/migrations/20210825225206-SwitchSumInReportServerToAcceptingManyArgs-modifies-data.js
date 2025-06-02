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
  const reportsWithSum = (await db.runSql("SELECT * from report WHERE config::text like '%sum([%'"))
    .rows;

  // Disabling trigger as otherwise encountered an error: payload string too long
  // This is caused by the trigger trying to pass a payload of over 8000 bytes to the notify channel
  await db.runSql('ALTER TABLE report DISABLE TRIGGER report_trigger;');
  for (let i = 0; i < reportsWithSum.length; i++) {
    const { code, config } = reportsWithSum[i];
    const fixedConfigString = JSON.stringify(config)
      .replace(/sum\(\[(.*?)\]\)/g, 'sum($1)')
      .replace(/'/g, "''");
    await db.runSql(`
        UPDATE report
        SET config = '${fixedConfigString}'::jsonb
        WHERE code = '${code}';
      `);
  }
  await db.runSql('ALTER TABLE report ENABLE TRIGGER report_trigger;');

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
