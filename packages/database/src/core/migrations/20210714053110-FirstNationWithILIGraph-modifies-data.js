'use strict';

import { insertObject, generateId, deleteObject } from '../utilities';

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

const reportCode = 'AU_FLUTRACKING_First_Nation_With_ILI';
const dataElementCode = 'FluTracker_Percent_First_Nations_ILI';
const dashboardCode = 'AU_FluTracking';

const permissionGroupNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

exports.up = async function (db) {
  const dashboardItemId = generateId();
  const dashboardRelationId = generateId();
  const dashboardId = generateId();

  await insertObject(db, 'report', {
    id: generateId(),
    code: reportCode,
    config: {
      fetch: {
        aggregations: ['RAW'],
        dataElements: [dataElementCode],
      },
      transform: [
        {
          transform: 'select',
          "'name'": '($row.period).substring(4, 7)',
          '($row.period).substring(0, 4)': '$row.value',
        },
        {
          '...': 'last',
          name: 'group',
          transform: 'aggregate',
        },
        {
          transform: 'sort',
          by: '$row.name',
        },
      ],
    },
    permission_group_id: await permissionGroupNameToId(db, 'Donor'),
  });

  await insertObject(db, 'dashboard_item', {
    id: dashboardItemId,
    code: reportCode,
    config: {
      name: 'Influenza-Like Illness (ILI) activity among First Nation participants',
      type: 'chart',
      chartType: 'line',
      valueType: 'percentage',
      chartConfig: {
        $all: { connectNulls: true },
      },
      xName: 'Date', // For showing correct first column name in table flapper
    },
    report_code: reportCode,
    legacy: false,
  });

  await insertObject(db, 'dashboard', {
    id: dashboardId,
    code: dashboardCode,
    name: 'FluTracking',
    root_entity_code: 'AU',
  });

  await insertObject(db, 'dashboard_relation', {
    id: dashboardRelationId,
    dashboard_id: dashboardId,
    child_id: dashboardItemId,
    entity_types: '{country}',
    project_codes: '{covidau}',
    permission_groups: '{Donor}',
  });

  const previousIndicator = 'FluTracker_LGA_Percent_First_Nations_ILI';
  await deleteObject(db, 'indicator', { code: previousIndicator });
  await deleteObject(db, 'data_source', { code: previousIndicator });
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM dashboard_relation dr
    USING dashboard_item di 
    WHERE dr.child_id = di.id 
    AND di.report_code = '${reportCode}';

    DELETE FROM dashboard_item 
    WHERE report_code = '${reportCode}';

    DELETE FROM report 
    WHERE code = '${reportCode}';
  `);
};

exports._meta = {
  version: 1,
};
