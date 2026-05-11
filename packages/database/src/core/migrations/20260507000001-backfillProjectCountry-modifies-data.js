'use strict';

import { generateId } from '../utilities';

var dbm;
var type;
var seed;

/**
 * backfill `project_country` from existing `entity_relation` rows
 */
const log = (msg, startTime) => {
  const elapsed = startTime ? ` (+${((Date.now() - startTime) / 1000).toFixed(1)}s)` : '';
  // eslint-disable-next-line no-console
  console.log(`[project_country migration: ]${elapsed} ${msg}`);
};

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  const t0 = Date.now();
  log('Starting up data migration', t0);

  const sourceRows = await db.runSql(`
    SELECT DISTINCT p.id AS project_id, c.id AS country_id
    FROM entity_relation er
    JOIN entity p_entity ON p_entity.id = er.parent_id AND p_entity.type = 'project'
    JOIN entity c ON c.id = er.child_id AND c.type = 'country'
    JOIN project p ON p.entity_id = p_entity.id;
  `);
  log(`Found ${sourceRows.rows.length} project↔country pairs to backfill`, t0);

  if (sourceRows.rows.length === 0) {
    log('No rows to backfill — finishing', t0);
    return;
  }

  const values = sourceRows.rows
    .map(({ project_id, country_id }) => `('${generateId()}','${project_id}','${country_id}')`)
    .join(',');
  await db.runSql(`
    INSERT INTO project_country (id, project_id, country_id)
    VALUES ${values}
    ON CONFLICT (project_id, country_id) DO NOTHING;
  `);
  log(`Inserted ${sourceRows.rows.length} project_country rows`, t0);

  log('Data migration complete', t0);
};

exports.down = async function (db) {
  await db.runSql(`DELETE FROM project_country;`);
};

exports._meta = {
  version: 1,
  targets: ['server', 'browser'],
};
