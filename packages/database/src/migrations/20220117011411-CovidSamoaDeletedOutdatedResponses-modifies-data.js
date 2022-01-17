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
  // Deleting a lot of data, we need to do it month by month
  let d = moment('2021-04-01');
  const max = moment('2022-01-10');

  while (d.isBefore(max)) {
    const formatted = d.format('YYYY-MM-DD');
    console.log(`Deleting data pre ${formatted}`);

    await db.runSql(
      `delete from answer where survey_response_id in (select id from survey_response where survey_id = (select id from survey where code = 'COVIDVac_WS') and data_time < '${formatted}');`,
    );
    await db.runSql(
      `delete from survey_response where survey_id = (select id from survey where code = 'COVIDVac_WS') and data_time < '${formatted}';`,
    );

    d = d.add(1, 'month');
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
