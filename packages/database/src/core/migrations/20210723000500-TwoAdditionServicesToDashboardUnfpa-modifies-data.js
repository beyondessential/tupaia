'use strict';

import { insertJsonEntry, removeJsonEntry } from '../utilities';

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

const gbvServicesCode = 'RHS2UNFPA263';
const ayfServicesCode = 'RHS2UNFPA236';

const facilityServicesCheckDashboardItemCode = 'UNFPA_RH_Services_Offered';
const facilityServicesLineGraphDashboardItemCode = 'UNFPA_Facilities_Offering_Services';

const insertToTablesParams = [
  {
    table: 'legacy_report',
    column: 'data_builder_config',
    path: ['dataClasses'],
    newValue: {
      'GBV Services': {
        numerator: { dataValues: [gbvServicesCode], valueOfInterest: 1 },
        denominator: {
          dataValues: [gbvServicesCode],
          valueOfInterest: '*',
        },
      },
      'AYF Services': {
        numerator: { dataValues: [ayfServicesCode], valueOfInterest: 1 },
        denominator: {
          dataValues: [ayfServicesCode],
          valueOfInterest: '*',
        },
      },
    },
    condition: { code: facilityServicesLineGraphDashboardItemCode },
  },
  {
    table: 'dashboard_item',
    column: 'config',
    path: ['chartConfig'],
    newValue: { 'GBV Services': {}, 'AYF Services': {} },
    condition: { code: facilityServicesLineGraphDashboardItemCode },
  },
  {
    table: 'legacy_report',
    column: 'data_builder_config',
    path: ['dataElementCodes'],
    newValue: [gbvServicesCode, ayfServicesCode],
    condition: { code: facilityServicesCheckDashboardItemCode },
  },
];

exports.up = async function (db) {
  return Promise.all(
    insertToTablesParams.map(async ({ table, column, path, newValue, condition }) => {
      await insertJsonEntry(db, table, column, path, newValue, condition);
    }),
  );
};

exports.down = async function (db) {
  return Promise.all(
    insertToTablesParams.map(async ({ table, column, path, newValue, condition }) => {
      if (!Array.isArray(newValue)) {
        await Promise.all(
          Object.keys(newValue).map(async key => {
            await removeJsonEntry(db, table, column, path, key, condition);
          }),
        );
      }
      // A hacky way to remove the last two item in array.
      await Promise.all(
        [4, 3].map(async key => {
          await removeJsonEntry(
            db,
            'legacy_report',
            'data_builder_config',
            ['dataElementCodes'],
            key,
            {
              code: facilityServicesCheckDashboardItemCode,
            },
          );
        }),
      );
    }),
  );
};

exports._meta = {
  version: 1,
};
