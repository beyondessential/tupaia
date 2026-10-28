'use strict';

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

const DATA_LAKE_CODES = `
  SELECT code FROM data_element WHERE service_type = 'data-lake'
  UNION
  SELECT code FROM data_group WHERE service_type = 'data-lake'
`;

/**
 * Records that still use the data lake, or would be orphaned by its removal. Reports and indicators
 * are matched by a quoted code anywhere in their config, or (for indicators) a token in their
 * formula.
 */
const DATA_LAKE_RECORD_QUERIES = {
  data_element: `SELECT code AS identifier FROM data_element WHERE service_type = 'data-lake'`,
  data_group: `SELECT code AS identifier FROM data_group WHERE service_type = 'data-lake'`,
  data_element_data_service: `
    SELECT data_element_code || ' (' || country_code || ')' AS identifier
    FROM data_element_data_service
    WHERE service_type = 'data-lake'
      OR data_element_code IN (SELECT code FROM data_element WHERE service_type = 'data-lake')
  `,
  report: `
    SELECT r.code AS identifier
    FROM report r
    WHERE EXISTS (
      SELECT 1
      FROM (${DATA_LAKE_CODES}) dlc
      WHERE strpos(r.config::text, '"' || dlc.code || '"') > 0
    )
  `,
  indicator: `
    SELECT i.code AS identifier
    FROM indicator i
    WHERE EXISTS (
      SELECT 1
      FROM (${DATA_LAKE_CODES}) dlc
      WHERE strpos(i.config::text, '"' || dlc.code || '"') > 0
        OR dlc.code = ANY (regexp_split_to_array(i.config ->> 'formula', '[^A-Za-z0-9_$@]+'))
    )
  `,
};

exports.up = async function (db) {
  const offenders = [];
  for (const [table, query] of Object.entries(DATA_LAKE_RECORD_QUERIES)) {
    const { rows } = await db.runSql(`${query};`);
    if (rows.length > 0) {
      offenders.push(`${table}: ${rows.map(row => row.identifier).join(', ')}`);
    }
  }

  if (offenders.length > 0) {
    throw new Error(
      `Data lake support has been removed, but these records still use or reference it. Delete or migrate them first:\n${offenders.join('\n')}`,
    );
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
