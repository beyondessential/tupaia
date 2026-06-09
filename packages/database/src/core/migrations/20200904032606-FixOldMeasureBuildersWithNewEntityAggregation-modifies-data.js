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
const PATH = [
  'measureBuilderConfig',
  'measureBuilders',
  'numerator',
  'measureBuilderConfig',
  'entityAggregation',
];

const NEW_AGGREGATION_TYPE = 'COUNT_PER_ORG_GROUP';
const NEW_CONFIG = {
  condition: {
    operator: '=',
    value: 'Yes',
  },
};

const OLD_AGGREGATION_TYPE = 'SUM_PER_ORG_GROUP';
const OLD_CONFIG = {
  valueToMatch: 'Yes',
};

exports.up = function (db) {
  return db.runSql(`
    update "mapOverlay"
    set "measureBuilderConfig" = jsonb_set(
            "measureBuilderConfig",
            '{${PATH.join(',')},aggregationType}',
            '"${NEW_AGGREGATION_TYPE}"'
          )
    where ("measureBuilderConfig"#>'{${PATH.join(',')}}')::text like '%valueToMatch%';

    update "mapOverlay"
    set "measureBuilderConfig" = jsonb_set(
            "measureBuilderConfig",
            '{${PATH.join(',')},aggregationConfig}',
            '${JSON.stringify(NEW_CONFIG)}'
          )
    where ("measureBuilderConfig"#>'{${PATH.join(',')}}')::text like '%valueToMatch%';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "mapOverlay"
    set "measureBuilderConfig" = jsonb_set(
            "measureBuilderConfig",
            '{${PATH.join(',')},aggregationType}',
            '"${OLD_AGGREGATION_TYPE}"'
          )
    where ("measureBuilderConfig"#>'{${PATH.join(',')}}')::text like '%valueToMatch%';

    update "mapOverlay"
    set "measureBuilderConfig" = jsonb_set(
            "measureBuilderConfig",
            '{${PATH.join(',')},aggregationConfig}',
            '${JSON.stringify(OLD_CONFIG)}'
          )
    where ("measureBuilderConfig"#>'{${PATH.join(',')}}')::text
            like '%${JSON.stringify(OLD_CONFIG)}%';
  `);
};

exports._meta = {
  version: 1,
};
