'use strict';

import { insertObject, generateId, findSingleRecord, findSingleRecordBySql } from '../utilities';

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

const CODE = 'PMOS_Mosquito_Occurence';
const COUNTRIES = ['FJ', 'KI', 'NR', 'NU', 'PG', 'SB', 'TV', 'TO', 'VU'];
const dataElementsToNames = {
  PMOS_An_Farauti: 'An. farauti',
  PMOS_An_Koliensis: 'An. koliensis',
  PMOS_An_Punctulatus: 'An. punctulatus',
  PMOS_Ae_Aegypti: 'Ae. aegypti',
  PMOS_Ae_Albopictus: 'Ae. albopictus',
  PMOS_Ae_Cooki: 'Ae. cooki',
  PMOS_Ae_Hensilli: 'Ae. hensilli',
  PMOS_Ae_Marshallensis: 'Ae. marshallensis',
  PMOS_Ae_Polynesiensis: 'Ae. polynesiensis',
  PMOS_Ae_Rotumae: 'Ae. rotumae',
  PMOS_Ae_Scutellaris: 'Ae. scutellaris',
  PMOS_Ae_Vigilax: 'Ae. vigilax',
  PMOS_Cx_Annulirostris: 'Cx. annulirostris',
  PMOS_Cx_Quinquefasciatus: 'Cx. quinquefasciatus',
  PMOS_Cx_Sitiens: 'Cx. sitiens',
  PMOS_Mn_Uniformis: 'Mn. uniformis',
};
const getDashboardCode = country => `${country}_PacMOSSI_Vector_Surveillance`;

const REPORT_CONFIG = {
  fetch: {
    dataElements: Object.keys(dataElementsToNames),
    aggregations: [
      {
        type: 'SUM_PER_ORG_GROUP',
        config: { dataSourceEntityType: 'field_station', aggregationEntityType: 'requested' },
      },
    ],
  },
  transform: [
    {
      transform: 'aggregate',
      period: 'drop',
      organisationUnit: 'drop',
      dataElement: 'group',
      value: 'sum',
    },
    {
      transform: 'select',
      "'name'": `translate($row.dataElement, ${JSON.stringify(dataElementsToNames)})`,
      '...': ['value'],
    },
    {
      transform: 'select',
      "concat($row.name, '_metadata')": '{ total: sum($all.value) }',
      '...': ['value', 'name'],
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'Mosquito species collected (Adult Occurrence)',
  type: 'chart',
  chartType: 'pie',
  valueType: 'number',
  labelType: 'fraction',
};

const removeDashboardItemAndReport = async (db, code) => {
  await db.runSql(`DELETE FROM dashboard_item WHERE code = '${code}';`); // delete cascades to dashboard_relation
  await db.runSql(`DELETE FROM report WHERE code = '${code}';`);
};

exports.up = async function (db) {
  const entityTypes = ['country', 'district', 'field_station'];
  const projectCodes = ['pacmossi'];
  const permissionGroup = 'PacMOSSI';

  // insert report
  const reportId = generateId();
  const permissionGroupId = (
    await findSingleRecord(db, 'permission_group', { name: permissionGroup })
  ).id;
  await insertObject(db, 'report', {
    id: reportId,
    code: CODE,
    config: REPORT_CONFIG,
    permission_group_id: permissionGroupId,
  });

  // insert dashboard item
  const dashboardItemId = generateId();
  await insertObject(db, 'dashboard_item', {
    id: dashboardItemId,
    code: CODE,
    config: FRONT_END_CONFIG,
    report_code: CODE,
  });

  await Promise.all(
    COUNTRIES.map(async country => {
      const dashboardCode = getDashboardCode(country);
      const dashboardId = (await findSingleRecord(db, 'dashboard', { code: dashboardCode })).id;
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
        entity_types: `{${entityTypes.join(', ')}}`,
        project_codes: `{${projectCodes.join(', ')}}`,
        permission_groups: `{${permissionGroup}}`,
        sort_order: maxSortOrder + 1,
      });
    }),
  );
};

exports.down = function (db) {
  return removeDashboardItemAndReport(db, CODE);
};

exports._meta = {
  version: 1,
};
