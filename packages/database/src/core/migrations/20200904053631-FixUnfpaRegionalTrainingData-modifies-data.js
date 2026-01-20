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

const PATH = ['dataBuilders', 'sumFacilitiesWithServicesAvailable'];

const OLD_CONFIG = {
  dataBuilder: 'sumValuesPerQuarterByOrgUnit',
  dataBuilderConfig: {
    valueOfInterest: {
      value: 0,
      operator: '>',
    },
    dataElementCodes: [],
    entityAggregation: {
      aggregationType: 'COUNT_PER_PERIOD_PER_ORG_GROUP',
      dataSourceEntityType: 'facility',
      aggregationEntityType: 'country',
    },
  },
};

const NEW_CONFIG = {
  dataBuilder: 'sumValuesPerQuarterByOrgUnit',
  dataBuilderConfig: {
    dataElementCodes: [],
    entityAggregation: {
      aggregationType: 'COUNT_PER_PERIOD_PER_ORG_GROUP',
      dataSourceEntityType: 'facility',
      aggregationEntityType: 'country',
      aggregationConfig: {
        condition: {
          value: 0,
          operator: '>',
        },
      },
    },
  },
};
const DASHBOARDS = [
  {
    id: 'UNFPA_Region_Facilities_Offering_Services_At_Least_1_Family_Planning',
    dataElementCodes: ['RHS4UNFPA809'],
  },
  {
    id: 'UNFPA_Region_Facilities_Offering_Services_At_Least_1_Delivery',
    dataElementCodes: ['RHS3UNFPA5410'],
  },
  {
    id: 'UNFPA_Region_Facilities_Offering_Services_At_Least_1_Delivery_SGBV',
    dataElementCodes: ['RHS2UNFPA292'],
  },
];
exports.up = function (db) {
  return Promise.all(
    DASHBOARDS.map(({ id, dataElementCodes }) => {
      NEW_CONFIG.dataBuilderConfig.dataElementCodes = dataElementCodes;
      return db.runSql(`
        update "dashboardReport"
        set "dataBuilderConfig" = jsonb_set(
              "dataBuilderConfig",
              '{${PATH.join(',')}}',
              '${JSON.stringify(NEW_CONFIG)}'
            )
        where id = '${id}';
      `);
    }),
  );
};

exports.down = function (db) {
  return Promise.all(
    DASHBOARDS.map(({ id, dataElementCodes }) => {
      OLD_CONFIG.dataBuilderConfig.dataElementCodes = dataElementCodes;
      return db.runSql(`
        update "dashboardReport"
        set "dataBuilderConfig" = jsonb_set(
              "dataBuilderConfig",
              '{${PATH.join(',')}}',
              '${JSON.stringify(OLD_CONFIG)}'
            )
        where id = '${id}';
      `);
    }),
  );
};

exports._meta = {
  version: 1,
};
