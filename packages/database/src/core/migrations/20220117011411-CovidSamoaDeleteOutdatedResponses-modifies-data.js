'use strict';

import moment from 'moment';

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
  await db.runSql('ALTER TABLE answer DISABLE TRIGGER answer_trigger;'); // Prevents this trigger from setting off automatic refreshes
  await db.runSql('ALTER TABLE survey_response DISABLE TRIGGER survey_response_trigger;');

  // Deleting a lot of data, we need to do it month by month
  let d = moment('2021-09-03');
  const max = moment('2022-01-22');

  while (d.isBefore(max)) {
    const formatted = d.format('YYYY-MM-DD');
    console.log(`Deleting data pre ${formatted}`);

    await db.runSql(
      `delete from answer where survey_response_id in (select id from survey_response where survey_id = (select id from survey where code = 'COVIDVac_WS') and outdated = true and start_time < '${formatted}');`,
    );
    await db.runSql(
      `delete from survey_response where survey_id = (select id from survey where code = 'COVIDVac_WS') and outdated = true and start_time < '${formatted}';`,
    );

    await db.runSql(`SELECT mv$refreshMaterializedView('analytics', 'public', true);`); // Perform fast refresh to integrate changes

    d = d.add(1, 'day');
  }

  await db.runSql('ALTER TABLE answer ENABLE TRIGGER answer_trigger;');
  await db.runSql('ALTER TABLE survey_response ENABLE TRIGGER survey_response_trigger;');
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
