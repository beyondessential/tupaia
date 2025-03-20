'use strict';

import { ExpressionParser } from '@tupaia/expression-parser';
import { arrayToDbString, nameToId, updateValues } from '../utilities';

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

const getAllDataElements = async (db, parser, indicator) => {
  const variables = parser.getVariables(indicator.config.formula);
  if (variables.length <= 0) {
    return [];
  }
  const subIndicators = (
    await db.runSql(`
    SELECT * from indicator
    WHERE code IN (${arrayToDbString(variables)})
  `)
  ).rows;

  let dataElements = variables.filter(varCode => !subIndicators.map(x => x.code).includes(varCode));
  for (const subIndicator of subIndicators) {
    dataElements = dataElements.concat(await getAllDataElements(db, parser, subIndicator));
  }
  return dataElements;
};

exports.up = async function (db) {
  // Disable data_element trigger
  await db.runSql(`ALTER TABLE data_element DISABLE TRIGGER "trig$_data_element"`);

  // Add column
  await db.runSql(`
    ALTER TABLE data_element
      ADD COLUMN permission_groups TEXT[] NOT NULL DEFAULT '{}'
  `);

  // Fill out permissions based on the surveys a data element is connected to (via questions)
  await db.runSql(`
    UPDATE data_element
      SET permission_groups = sub_query.permission_groups
      FROM (
          SELECT data_element_id, array_agg(survey.permission_group_id) as permission_groups
          FROM data_element_data_group
          INNER JOIN survey
            ON survey.data_group_id = data_element_data_group.data_group_id
          GROUP BY data_element_id
        ) AS sub_query
      WHERE data_element.id = sub_query.data_element_id
  `);

  // For indicators, process with the expression parser and use the same permissions as the data elements
  const parser = new ExpressionParser();
  const indicators = (
    await db.runSql(`
    SELECT * from data_element
      INNER JOIN indicator
      ON data_element.code = indicator.code
    WHERE data_element.service_type = 'indicator'
  `)
  ).rows;

  for (const indicator of indicators) {
    const variables = await getAllDataElements(db, parser, indicator);
    if (variables.length <= 0) {
      continue;
    }
    const permissions = (
      await db.runSql(`
        SELECT array_agg(distinct(permissions)) AS permission_groups
          FROM data_element, unnest(permission_groups) AS permissions
        WHERE code IN (${arrayToDbString(variables)})
      `)
    ).rows[0];

    if (permissions.permission_groups) {
      await updateValues(
        db,
        'data_element',
        { permission_groups: permissions.permission_groups || [] },
        { code: indicator.code },
      );
    }
  }

  // Update to wildcard if the value is in public permission group
  // or if we haven't found any permissions so far
  const publicPermissionId = await nameToId(db, 'permission_group', 'Public');
  await db.runSql(`
    UPDATE data_element
      SET permission_groups = '{"*"}'
      WHERE '${publicPermissionId}' = ANY(permission_groups)
      OR permission_groups = '{}'
  `);
  // Enable data_element trigger
  await db.runSql(`ALTER TABLE data_element ENABLE TRIGGER "trig$_data_element"`);
};

exports.down = async function (db) {
  await db.runSql(`
    ALTER TABLE data_element
      DROP COLUMN permission_groups
  `);
};

exports._meta = {
  version: 1,
};
