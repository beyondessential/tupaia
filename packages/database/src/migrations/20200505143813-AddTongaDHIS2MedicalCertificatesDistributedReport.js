'use strict';

import { insertObject } from '../utilities/migration';

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

const DATA_BUILDER_CONFG = {
  labels: {
    CD73: 'Missionary - LDS',
    CD74: 'Missionary - Other',
    CD75: 'Visa - Tonga Immigration',
    CD76: 'Visa - China',
    CD77: 'Visa - Fiji',
    CD81: 'Visa - Malaysia',
    CD82: 'Visa - Samoa (Apia and Pangopango)',
    CD83: 'Visa - Thailand',
    CD84: 'Visa - Other',
    CD84a: 'Employment - Army, Firemen, Wardens',
    CD85: 'Employment - Bankers (BSP, TDB)',
    CD86: 'Employment - FWC Workers',
    CD87: 'Employment - South Pacific Business Development (SPBD)',
    CD88: 'Employment - Seafarers',
    CD89: 'Employment - Tonga Civil Servant (all government workers)',
    CD90: 'Employment - Other',
  },
  dataElementCodes: [
    'CD73',
    'CD74',
    'CD75',
    'CD76',
    'CD77',
    'CD81',
    'CD82',
    'CD83',
    'CD84',
    'CD84a',
    'CD85',
    'CD86',
    'CD87',
    'CD88',
    'CD89',
    'CD90',
  ],
};

const VIEW_JSON_CONFIG = {
  name: 'Medical Certificates Distributed (by type)',
  type: 'chart',
  chartType: 'bar',
  periodGranularity: 'month',
};

const DASHBOARD_GROUP = 'Tonga_Communicable_Diseases_National';

const REPORT_ID = 'TO_CD_Medical_Certs_Distributed';

const DATA_SERVICES = [{ isDataRegional: false }];

const REPORT = {
  id: REPORT_ID,
  dataBuilder: 'sumAllPerMetric',
  dataBuilderConfig: DATA_BUILDER_CONFG,
  viewJson: VIEW_JSON_CONFIG,
  dataServices: DATA_SERVICES,
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${REPORT_ID}}'
    WHERE code = '${DASHBOARD_GROUP}';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT_ID}';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
    WHERE code = '${DASHBOARD_GROUP}';
  `);
};

exports._meta = {
  version: 1,
};
