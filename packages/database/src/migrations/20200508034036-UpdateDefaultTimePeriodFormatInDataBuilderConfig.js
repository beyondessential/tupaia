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

const DEFAULT_TIME_PERIOD_JSONPATH = '{defaultTimePeriod}';
const DEFAULT_TIME_PERIOD_FORMAT_JSONPATH = '{defaultTimePeriod,format}';
const DEFAULT_TIME_PERIOD_UNIT_JSONPATH = '{defaultTimePeriod,unit}';

const NEW_DEFAULT_TIME_PERIOD_FORMAT_VALUE_DAY = 'day';
const OLD_DEFAULT_TIME_PERIOD_FORMAT_VALUE_DAY = 'days';

const NEW_DEFAULT_TIME_PERIOD_FORMAT_VALUE_MONTH = 'month';
const OLD_DEFAULT_TIME_PERIOD_FORMAT_VALUE_MONTH = 'months';

const NEW_DEFAULT_TIME_PERIOD_FORMAT_VALUE_YEAR = 'year';
const OLD_DEFAULT_TIME_PERIOD_FORMAT_VALUE_YEAR = 'years';

exports.up = async function (db) {
  // Update unit from plural to singular. Eg: 'months' -> 'month', 'years' -> 'year
  await db.runSql(`
    UPDATE "dashboardReport"
    SET "viewJson" = jsonb_set("viewJson", '${DEFAULT_TIME_PERIOD_FORMAT_JSONPATH}', '"${NEW_DEFAULT_TIME_PERIOD_FORMAT_VALUE_DAY}"')
    WHERE "viewJson"->'defaultTimePeriod' @> '{"format": "days"}';

    UPDATE "dashboardReport"
    SET "viewJson" = jsonb_set("viewJson", '${DEFAULT_TIME_PERIOD_FORMAT_JSONPATH}', '"${NEW_DEFAULT_TIME_PERIOD_FORMAT_VALUE_MONTH}"')
    WHERE "viewJson"->'defaultTimePeriod' @> '{"format": "months"}';

    UPDATE "dashboardReport"
    SET "viewJson" = jsonb_set("viewJson", '${DEFAULT_TIME_PERIOD_FORMAT_JSONPATH}', '"${NEW_DEFAULT_TIME_PERIOD_FORMAT_VALUE_YEAR}"')
    WHERE "viewJson"->'defaultTimePeriod' @> '{"format": "years"}';
  `);

  // Update keys in defaultTimePeriod. value -> offset, format -> unit
  await db.runSql(`
    UPDATE "dashboardReport"
    SET "viewJson" = jsonb_set("viewJson", '${DEFAULT_TIME_PERIOD_JSONPATH}', "viewJson"->'defaultTimePeriod' || jsonb_build_object('unit', "viewJson"->'defaultTimePeriod'->'format') #- '{format}')
    WHERE "viewJson"->'defaultTimePeriod' ? 'format';

    UPDATE "dashboardReport"
    SET "viewJson" = jsonb_set("viewJson", '${DEFAULT_TIME_PERIOD_JSONPATH}', "viewJson"->'defaultTimePeriod' || jsonb_build_object('offset', "viewJson"->'defaultTimePeriod'->'value') #- '{value}')
    WHERE "viewJson"->'defaultTimePeriod' ? 'value';
  `);
};

exports.down = async function (db) {
  // Update unit from plural to singular. Eg: 'months' -> 'month', 'years' -> 'year
  await db.runSql(`
    UPDATE "dashboardReport"
    SET "viewJson" = jsonb_set("viewJson", '${DEFAULT_TIME_PERIOD_UNIT_JSONPATH}', '"${OLD_DEFAULT_TIME_PERIOD_FORMAT_VALUE_DAY}"')
    WHERE "viewJson"->'defaultTimePeriod' @> '{"unit": "day"}';

    UPDATE "dashboardReport"
    SET "viewJson" = jsonb_set("viewJson", '${DEFAULT_TIME_PERIOD_UNIT_JSONPATH}', '"${OLD_DEFAULT_TIME_PERIOD_FORMAT_VALUE_MONTH}"')
    WHERE "viewJson"->'defaultTimePeriod' @> '{"unit": "month"}';

    UPDATE "dashboardReport"
    SET "viewJson" = jsonb_set("viewJson", '${DEFAULT_TIME_PERIOD_UNIT_JSONPATH}', '"${OLD_DEFAULT_TIME_PERIOD_FORMAT_VALUE_YEAR}"')
    WHERE "viewJson"->'defaultTimePeriod' @> '{"unit": "year"}';
  `);

  // Update keys in defaultTimePeriod. value -> offset, format -> unit
  await db.runSql(`
    UPDATE "dashboardReport"
    SET "viewJson" = jsonb_set("viewJson", '${DEFAULT_TIME_PERIOD_JSONPATH}', "viewJson"->'defaultTimePeriod' || jsonb_build_object('format', "viewJson"->'defaultTimePeriod'->'unit') #- '{unit}')
    WHERE "viewJson"->'defaultTimePeriod' ? 'unit';

    UPDATE "dashboardReport"
    SET "viewJson" = jsonb_set("viewJson", '${DEFAULT_TIME_PERIOD_JSONPATH}', "viewJson"->'defaultTimePeriod' || jsonb_build_object('value', "viewJson"->'defaultTimePeriod'->'offset') #- '{offset}')
    WHERE "viewJson"->'defaultTimePeriod' ? 'offset';
  `);
};

exports._meta = {
  version: 1,
};
