'use strict';

import { insertObject, generateId, codeToId } from '../utilities';

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

const permissionGroupNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

exports.up = async function (db) {
  const dashboardItemId = generateId();
  const dashboardRelationId = generateId();
  await insertObject(db, 'report', {
    id: generateId(),
    code: reportCode,
    config: {
      fetch: {
        aggregations: ['RAW'],
        dataElements: ['FluTracker_LGA_Percent_First_Nations_ILI'],
      },
      transform: [
        'convertPeriodToWeek',
        {
          transform: 'select',
          "'name'": '($row.period).substring(4, 7)',
          '($row.period).substring(0, 4)': '$row.value',
        },
        {
          transform: 'aggregate',
          name: 'group',
          '...': 'last',
        },
        {
          transform: 'select',
          "'timestamp'": "periodToTimestamp(('2020').concat($row.name))",
          '...': '*',
        },
      ],
    },
    permission_group_id: await permissionGroupNameToId(db, 'Public'),
  });

  await insertObject(db, 'dashboard_item', {
    id: dashboardItemId,
    code: 'AU_FLUTRACKING_First_Nation_With_ILI',
    config: {
      name: 'Influenza-Like Illness (ILI) activity among First Nation participants',
      type: 'chart',
      chartType: 'line',
      valueType: 'percentage',
      chartConfig: {
        $all: {},
      },
      presentationOptions: {
        periodTickFormat: '[W]w',
      },
    },
    report_code: reportCode,
    legacy: false,
  });

  await insertObject(db, 'dashboard_relation', {
    id: dashboardRelationId,
    dashboard_id: await codeToId(db, 'dashboard', 'AU_COVID-19'),
    child_id: dashboardItemId,
    entity_types: '{country}',
    project_codes: '{covidau}',
    permission_groups: '{Public}',
    sort_order: 11,
  });
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
