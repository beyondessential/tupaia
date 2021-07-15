'use strict';

var dbm;
var type;
var seed;

const updateMapOverlayConfig = (db, mapOverlayId, measureBuilderConfig) => {
  return db.runSql(`
    UPDATE "mapOverlay" 
    SET "measureBuilderConfig" = '${JSON.stringify(measureBuilderConfig)}'
    where id = '${mapOverlayId}';
  `);
};

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const MAP_OVERLAY_CONFIGS = {
  COVID_AU_State_Total_Number_Confirmed_Cases: {
    commonConfig: {
      entityAggregation: {
        dataSourceEntityType: 'district',
      },
    },
    newConfig: {
      aggregations: [
        {
          type: 'FINAL_EACH_DAY',
        },
        {
          type: 'SUM',
        },
      ],
    },
    oldConfig: {
      aggregationType: 'SUM',
    },
  },
};

exports.up = async function (db) {
  return Promise.all(
    Object.entries(MAP_OVERLAY_CONFIGS).map(async ([mapOverlayId, { commonConfig, newConfig }]) =>
      updateMapOverlayConfig(db, mapOverlayId, {
        ...commonConfig,
        ...newConfig,
      }),
    ),
  );
};

exports.down = async function (db) {
  return Promise.all(
    Object.entries(MAP_OVERLAY_CONFIGS).map(async ([mapOverlayId, { commonConfig, oldConfig }]) =>
      updateMapOverlayConfig(db, mapOverlayId, {
        ...commonConfig,
        ...oldConfig,
      }),
    ),
  );
};

exports._meta = {
  version: 1,
};
