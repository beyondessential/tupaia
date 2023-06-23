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

const NUMERATOR_PATH = [
  'measureBuilderConfig',
  'measureBuilders',
  'numerator',
  'measureBuilderConfig',
  'entityAggregation',
];
const DENOMINATOR_PATH = [
  'measureBuilderConfig',
  'measureBuilders',
  'denominator',
  'measureBuilderConfig',
  'entityAggregation',
];

const NEW_AGGREGATION_TYPE = 'COUNT_PER_ORG_GROUP'; // Used to be SUM_PER_ORG_GROUP

const NEW_NUMERATOR_CONFIG = {
  condition: {
    operator: '=',
    value: 'Yes',
  },
};
const NEW_DENOMINATOR_CONFIG = {
  condition: '*',
};

exports.up = function (db) {
  return db.runSql(`
    update "mapOverlay"
    set "measureBuilderConfig" = jsonb_set(
            "measureBuilderConfig",
            '{${NUMERATOR_PATH.join(',')},aggregationType}',
            '"${NEW_AGGREGATION_TYPE}"'
          )
    where ("measureBuilderConfig"#>'{${NUMERATOR_PATH.join(',')}}')::text like '%valueToMatch%';

    update "mapOverlay"
    set "measureBuilderConfig" = jsonb_set(
            "measureBuilderConfig",
            '{${NUMERATOR_PATH.join(',')},aggregationConfig}',
            '${JSON.stringify(NEW_NUMERATOR_CONFIG)}'
          )
    where ("measureBuilderConfig"#>'{${NUMERATOR_PATH.join(',')}}')::text like '%valueToMatch%';

    update "mapOverlay"
    set "measureBuilderConfig" = jsonb_set(
            "measureBuilderConfig",
            '{${DENOMINATOR_PATH.join(',')},aggregationType}',
            '"${NEW_AGGREGATION_TYPE}"'
          )
    where ("measureBuilderConfig"#>'{${DENOMINATOR_PATH.join(',')}}')::text like '%valueToMatch%';

    update "mapOverlay"
    set "measureBuilderConfig" = jsonb_set(
            "measureBuilderConfig",
            '{${DENOMINATOR_PATH.join(',')},aggregationConfig}',
            '${JSON.stringify(NEW_DENOMINATOR_CONFIG)}'
          )
    where ("measureBuilderConfig"#>'{${DENOMINATOR_PATH.join(',')}}')::text like '%valueToMatch%';
  `);
};

exports.down = function (db) {
  // No migration down
};

exports._meta = {
  version: 1,
};
