import { arrayToDbString } from '../utilities';

('use strict');

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

exports.up = async function (db) {
  // Disable data_element trigger
  await db.runSql(`ALTER TABLE data_element DISABLE TRIGGER "trig$_data_element"`);

  // Swap out permission_group ids for names
  // This also drops the wildcard, so we need to recalc it at the end of this migration
  await db.runSql(
    `UPDATE data_element SET permission_groups = ARRAY(SELECT name FROM permission_group WHERE id = ANY(data_element.permission_groups))`,
  );

  const { rows: dataElements } = await db.runSql(`SELECT * FROM data_element`);

  for (const element of dataElements) {
    // Fetch data groups containing the data element
    const { rows: dataGroups } = await db.runSql(
      `SELECT * from data_group WHERE id IN
       (SELECT data_group_id FROM data_element_data_group WHERE data_element_id = '${element.id}')`,
    );
    // Recursively fetch all indicators that use the data element
    const { rows: indicators } = await db.runSql(
      `WITH RECURSIVE parent_indicator AS (
        SELECT * FROM indicator
        WHERE
          config::TEXT ILIKE '%${element.code}%'
        UNION
          SELECT i.* FROM indicator i
          INNER JOIN parent_indicator pi
          ON
            i.config::TEXT ILIKE '%' || pi.code || '%'
      ) SELECT * FROM parent_indicator`,
    );

    // Fetch reports that contain either the data element, data group, or indicators
    const { rows: reports } = await db.runSql(
      `SELECT * from report WHERE text(report.config) SIMILAR TO '%(${[
        element,
        ...dataGroups,
        ...indicators,
      ]
        .map(x => x.code)
        .join('|')})%'`,
    );
    const { rows: legacyReports } = await db.runSql(
      `SELECT * from legacy_report WHERE
      (
        ${
          // If this element appears in reports, find any 'useReportServer' legacy_reports that use it
          reports.length > 0
            ? `legacy_report.data_builder = 'useReportServer' AND
          text(legacy_report.data_builder_config) SIMILAR TO '%(${reports
            .map(x => x.code)
            .join('|')})%'`
            : 'false'
        }
      )
      OR
      (
        text(legacy_report.data_builder_config) SIMILAR TO '%(${[
          element,
          ...dataGroups,
          ...indicators,
        ]
          .map(x => x.code)
          .join('|')})%'
      )`,
    );

    const jointReportCodes = reports
      .map(report => report.code)
      .concat(legacyReports.map(report => report.code));

    if (jointReportCodes.length <= 0) {
      continue;
    }

    // Fetch dashboard relations using reports
    const { rows: dashboardRelations } = await db.runSql(
      `SELECT * from dashboard_relation where child_id in
        (SELECT id from dashboard_item WHERE report_code in (${arrayToDbString(
          jointReportCodes,
        )}))`,
    );
    // Fetch map overlays using reports
    const { rows: mapOverlays } = await db.runSql(
      `SELECT * from map_overlay WHERE report_code in (${arrayToDbString(jointReportCodes)})`,
    );

    const jointPermissionGroups = dashboardRelations
      .flatMap(rel => rel.permission_groups)
      .concat(mapOverlays.map(map => map.permission_group));

    if (jointPermissionGroups.length <= 0) {
      continue;
    }

    const { rows: permissionGroups } = await db.runSql(
      `SELECT * from permission_group where name in (${arrayToDbString(jointPermissionGroups)})`,
    );

    await db.runSql(
      `UPDATE data_element SET permission_groups = ARRAY(SELECT DISTINCT UNNEST(permission_groups || '{${permissionGroups
        .map(group => group.name)
        .join(',')}}')) WHERE data_element.id = '${element.id}'`,
    );
  }

  // Recalculate wildcards
  // Any data element with the public permission group, or with no permission groups
  await db.runSql(`
    UPDATE data_element
      SET permission_groups = array_prepend('*', permission_groups)
      WHERE 'Public' = ANY(permission_groups)
      OR permission_groups = '{}'
  `);

  // Enable data_element trigger
  await db.runSql(`ALTER TABLE data_element ENABLE TRIGGER "trig$_data_element"`);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
