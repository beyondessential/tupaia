'use strict';

import { codeToId, generateId, insertObject } from '../utilities';

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

const syndromes = ['AFR', 'DIA', 'ILI', 'PF', 'DLI', 'CON'];

const getOriginalId = syndrome => `PSSS_PW_${syndrome}_Weekly_Case_Trend_Graph_Facility`;
const getNewId = syndrome => `PSSS_${syndrome}_Weekly_Case_Trend_Graph_Facility`;

exports.up = async function (db) {
  const dashboardItemsIds = [];
  for (const syndrome of syndromes) {
    const originalId = getOriginalId(syndrome);
    const newId = getNewId(syndrome);
    await db.runSql(`
      UPDATE "dashboard_item" 
      SET 
      "code" = '${newId}',
      "report_code" = '${newId}'
      WHERE 
      "code" = '${originalId}';

      UPDATE "legacy_report" 
      SET 
      "code" = '${newId}'
      WHERE 
      "code" = '${originalId}';
    `);
    // We don't need to add `CON` weekly case to FIJI
    if (syndrome !== 'CON') {
      dashboardItemsIds.push(newId);
    }
  }

  const dashboardId = generateId();
  await insertObject(db, 'dashboard', {
    id: dashboardId,
    code: 'FJ_Syndromic_Surveillance_Facility',
    name: 'Syndromic Surveillance',
    root_entity_code: 'FJ',
  });

  for (const [index, dashboardItemCode] of dashboardItemsIds.entries()) {
    const dashboardItemId = await codeToId(db, 'dashboard_item', dashboardItemCode);
    await insertObject(db, 'dashboard_relation', {
      id: generateId(),
      dashboard_id: dashboardId,
      child_id: dashboardItemId,
      entity_types: '{facility}',
      project_codes: '{psss}',
      permission_groups: '{Public}',
      sort_order: index,
    });
  }
};

exports.down = function (db) {};

exports._meta = {
  version: 1,
};
