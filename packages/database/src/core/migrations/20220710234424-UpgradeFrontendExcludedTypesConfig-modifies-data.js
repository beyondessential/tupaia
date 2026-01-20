'use strict';

const { insertJsonEntry, removeJsonEntry } = require('../utilities');

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
  const projects = (
    await db.runSql(`
      SELECT code, config FROM project; 
  `)
  ).rows;

  return Promise.all(
    projects
      .filter(({ config }) => !!config.frontendExcludedTypes)
      .map(async ({ code, config }) => {
        const { frontendExcludedTypes } = config;
        const frontendExcluded = [
          {
            types: frontendExcludedTypes,
          },
        ];

        if (code === 'olangch_palau') {
          frontendExcluded[0].exceptions = { permissionGroups: ['Palau Environmental Health'] };
        }

        await insertJsonEntry(
          db,
          'project',
          'config',
          [],
          {
            frontendExcluded,
          },
          { code },
        );

        await removeJsonEntry(db, 'project', 'config', [], 'frontendExcludedTypes', {
          code,
        });
      }),
  );
};

exports.down = async function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
