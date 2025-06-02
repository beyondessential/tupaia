'use strict';

import { generateId, insertObject, arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

const permissionGroupNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
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

const REPORT = {
  id: generateId(),
  code: 'PG_Strive_PNG_Observed_Replicate_Mortality',
  config: {
    fetch: {
      dataGroups: ['STRVEC_AE-IR', 'STRVEC_AN-IR'],
      dataElements: ['STRVEC_AE-IR09', 'STRVEC_AE-IR02', 'STRVEC_AN-IR09', 'STRVEC_AN-IR02'],
      aggregations: [
        {
          type: 'RAW',
          config: { dataSourceEntityType: 'facility' },
        },
      ],
    },
    transform: [
      // Filter to ensure all events have IR02 and IR09 data elements present
      {
        transform: 'filter',
        where:
          "(exists($row['STRVEC_AE-IR09']) and exists($row['STRVEC_AE-IR02'])) or (exists($row['STRVEC_AN-IR09']) and exists($row['STRVEC_AN-IR02']))",
      },
      // Remap the AE and AN specific dataElements into common fields, note 'name' is the Insecticide
      {
        transform: 'select',
        "'MosquitoType'": "exists($row['STRVEC_AE-IR09']) ? 'Aedes IR' : 'Anopheles IR'",
        "'name'":
          "exists($row['STRVEC_AE-IR02']) ? $row['STRVEC_AE-IR02'] : $row['STRVEC_AN-IR02']",
        "'ObservedReplicateMortality'":
          "exists($row['STRVEC_AE-IR09']) ? $row['STRVEC_AE-IR09'] / 100 : $row['STRVEC_AN-IR09'] / 100", // Divide by 100 here as the percentage comes a number rather than decimal
      },
      // Aggregate to get average('ObservedReplicateMortality') per MosquitoType and Insecticide
      {
        transform: 'aggregate',
        MosquitoType: 'group',
        name: 'group',
        ObservedReplicateMortality: 'avg',
      },
      // Format to be [{ "name": "0.1% Bendiocarb", "Aedes IR": 0.929293 },  { "name": "0.1% Bendiocarb", "Anopheles IR": 0.83924 }, ...]
      {
        transform: 'select',
        '$row.MosquitoType': '$row.ObservedReplicateMortality',
        '...': ['name'],
      },
      // Combine rows of the same Insecticide so that values for both 'Aedes IR' and 'Anopheles IR' are in the same row
      {
        transform: 'aggregate',
        name: 'group',
        '...': 'first', // Using 'first' is safe here since our previous 'aggregate' transform ensured there is a single row Insecticide and MosquitoType
      },
    ],
  },
};

const getReport = permissionGroupId => ({ ...REPORT, permission_group_id: permissionGroupId });

const DASHBOARD_GROUP_CODES = [
  'PG_Strive_PNG_Country',
  'PG_Strive_PNG_District',
  'PG_Strive_PNG_Facility',
];

const DASHBOARD_REPORT = {
  id: 'PG_Strive_PNG_Observed_Replicate_Mortality_Bar_Chart',
  dataBuilder: 'reportServer',
  dataBuilderConfig: {
    reportCode: REPORT.code,
  },
  viewJson: {
    name: '	Observed Replicate Mortality',
    type: 'chart',
    chartType: 'bar',
    valueType: 'percentage',
    chartConfig: {
      'Aedes IR': {
        legendOrder: 1,
      },
      'Anopheles IR': {
        legendOrder: 2,
      },
    },
    presentationOptions: {
      hideAverage: true,
    },
  },
};

exports.up = async function (db) {
  const permissionGroupId = await permissionGroupNameToId(db, 'STRIVE User');
  const report = getReport(permissionGroupId);
  await insertObject(db, 'report', report);

  await insertObject(db, 'dashboardReport', DASHBOARD_REPORT);

  await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${DASHBOARD_REPORT.id} }'
    WHERE
      "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM report
    WHERE code = '${REPORT.code}';
  `);

  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${DASHBOARD_REPORT.id}';
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${DASHBOARD_REPORT.id}')
    WHERE
      "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
