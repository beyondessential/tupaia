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
    UPDATE analytics
    SET final_per_year = false, final_per_year = false, final_per_year = false, final_per_year = false
  `);

  await db.runSql(`
    UPDATE analytics
    SET final_per_day = true
    WHERE id IN (
      SELECT id
      FROM analytics
      INNER JOIN (
        SELECT MAX(date) as max_date, entity_code, data_element_code, date_trunc('day', date) as day
        FROM analytics
        GROUP BY entity_code, data_element_code, day
      ) max_days ON analytics.entity_code = max_days.entity_code AND analytics.data_element_code = max_days.data_element_code AND date_trunc('day', analytics.date) = max_days.day AND analytics.date = max_days.max_date
    )
  `);

  await db.runSql(`
    UPDATE analytics
    SET final_per_week = true
    WHERE id IN (
      SELECT id
      FROM analytics
      INNER JOIN (
        SELECT MAX(date) as max_date, entity_code, data_element_code, date_trunc('week', date) as week
        FROM analytics
        GROUP BY entity_code, data_element_code, week
      ) max_days ON analytics.entity_code = max_days.entity_code AND analytics.data_element_code = max_days.data_element_code AND date_trunc('week', analytics.date) = max_days.week AND analytics.date = max_days.max_date
    )
  `);

  await db.runSql(`
    UPDATE analytics
    SET final_per_month = true
    WHERE id IN (
      SELECT id
      FROM analytics
      INNER JOIN (
        SELECT MAX(date) as max_date, entity_code, data_element_code, date_trunc('month', date) as month
        FROM analytics
        GROUP BY entity_code, data_element_code, month
      ) max_days ON analytics.entity_code = max_days.entity_code AND analytics.data_element_code = max_days.data_element_code AND date_trunc('month', analytics.date) = max_days.month AND analytics.date = max_days.max_date
    )
  `);

  await db.runSql(`
    UPDATE analytics
    SET final_per_year = true
    WHERE id IN (
      SELECT id
      FROM analytics
      INNER JOIN (
        SELECT MAX(date) as max_date, entity_code, data_element_code, date_trunc('year', date) as year
        FROM analytics
        GROUP BY entity_code, data_element_code, year
      ) max_days ON analytics.entity_code = max_days.entity_code AND analytics.data_element_code = max_days.data_element_code AND date_trunc('year', analytics.date) = max_days.year AND analytics.date = max_days.max_date
    )
  `);

  return null;
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE analytics
    SET final_per_year = false, final_per_year = false, final_per_year = false, final_per_year = false
  `);

  return null;
};

exports._meta = {
  version: 1,
};
