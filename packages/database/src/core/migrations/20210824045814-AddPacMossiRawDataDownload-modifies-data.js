'use strict';

import { codeToId, insertObject, generateId, findSingleRecordBySql } from '../utilities';

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

const PROJECT_NAME = 'PacMOSSI';
const COUNTRY_CODES = ['FJ', 'KI', 'NR', 'NU', 'PG', 'SB', 'TV', 'TO', 'VU'];
const DASHBOARD_NAME = 'PacMOSSI Raw Data Downloads';
const DASHBOARD_ITEM_NAME = 'Download Vector Surveillance Survey Data';

const getCountryDashboardCode = countryCode =>
  `${countryCode}_${DASHBOARD_NAME.split(' ').join('_')}`;

const getCountryDashboardItemCode = countryCode =>
  `${countryCode}_${PROJECT_NAME}_${DASHBOARD_ITEM_NAME.split(' ').join('_')}`;

const REPORT_CONFIG = {
  surveys: [
    {
      code: 'PPM',
      name: 'PacMOSSI Project Metadata',
    },
    {
      code: 'PFSM',
      name: 'PacMOSSI Field Station Mapping',
    },
    {
      code: 'PAMC',
      name: 'PacMOSSI Adult Mosquito Collection',
    },
    {
      code: 'PLS',
      name: 'PacMOSSI Larval Survey',
    },
    {
      code: 'PIR',
      name: 'PacMOSSI Insecticide Resistance',
    },
    {
      code: 'PMS',
      name: 'PacMOSSI Mosquito Storage',
    },
  ],
  exportDataBuilder: {
    dataBuilder: 'rawDataValues',
    dataBuilderConfig: {
      surveysConfig: {
        PPM: {
          entityAggregation: {
            dataSourceEntityType: 'country',
          },
        },
        PFSM: {
          entityAggregation: {
            dataSourceEntityType: 'field_station',
          },
        },
        PAMC: {
          entityAggregation: {
            dataSourceEntityType: 'field_station',
          },
        },
        PLS: {
          entityAggregation: {
            dataSourceEntityType: 'larval_habitat',
          },
        },
        PIR: {
          entityAggregation: {
            dataSourceEntityType: 'field_station',
          },
        },
        PMS: {
          entityAggregation: {
            dataSourceEntityType: 'district',
          },
        },
      },
    },
  },
};

const FRONTEND_CONFIG = {
  name: 'Download Vector Surveillance Survey Data',
  type: 'view',
  viewType: 'dataDownload',
  periodGranularity: 'year',
};

const addDashboardItemToCountry = async (db, countryCode) => {
  await insertObject(db, 'legacy_report', {
    id: generateId(),
    code: getCountryDashboardItemCode(countryCode),
    data_builder: 'surveyDataExport',
    data_builder_config: REPORT_CONFIG,
    data_services: [{ isDataRegional: true }],
  });

  const dashboardId = generateId();
  await insertObject(db, 'dashboard', {
    id: dashboardId,
    code: getCountryDashboardCode(countryCode),
    name: DASHBOARD_NAME,
    root_entity_code: countryCode,
    sort_order: 2,
  });

  const dashboardItemId = generateId();
  await insertObject(db, 'dashboard_item', {
    id: dashboardItemId,
    code: getCountryDashboardItemCode(countryCode),
    config: FRONTEND_CONFIG,
    report_code: getCountryDashboardItemCode(countryCode),
    legacy: true,
  });

  const maxSortOrder = (
    await findSingleRecordBySql(
      db,
      `SELECT max(sort_order) as max_sort_order FROM dashboard_relation WHERE dashboard_id = '${dashboardId}';`,
    )
  ).max_sort_order;

  await insertObject(db, 'dashboard_relation', {
    id: generateId(),
    dashboard_id: dashboardId,
    child_id: dashboardItemId,
    entity_types: '{country}',
    project_codes: '{pacmossi}',
    permission_groups: '{PacMOSSI Senior}',
    sort_order: maxSortOrder + 1,
  });
};

exports.up = async function (db) {
  await Promise.all(
    COUNTRY_CODES.map(async countryCode => addDashboardItemToCountry(db, countryCode)),
  );
};

exports.down = async function (db) {
  for (const countryCode of COUNTRY_CODES) {
    const dashboardItemId = await codeToId(
      db,
      'dashboard_item',
      getCountryDashboardItemCode(countryCode),
    );
    const dashboardId = await codeToId(db, 'dashboard', getCountryDashboardCode(countryCode));
    await db.runSql(`
      delete from "dashboard_relation" where dashboard_id = '${dashboardId}' and child_id = '${dashboardItemId}';
      delete from "legacy_report" where code = '${getCountryDashboardItemCode(countryCode)}';
      delete from "dashboard_item" where code = '${getCountryDashboardItemCode(countryCode)}';
      delete from "dashboard" where code = '${getCountryDashboardCode(countryCode)}';
    `);
  }
};

exports._meta = {
  version: 1,
};
