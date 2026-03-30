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

const PROJECTS_USING_ALTERNATIVE_HIERARCHIES = [
  'laos_schools',
  'wish', // now now, but soon
  'covidau', // not now, but soon
];

const EXPLORE_PROJECT = 'explore';

const addVisualisationsToExplore = (db, tableName) =>
  db.runSql(`
  UPDATE "${tableName}"
  SET "projectCodes" = "projectCodes" || '{"${EXPLORE_PROJECT}"}'
  WHERE
    (NOT "projectCodes" @> '{${EXPLORE_PROJECT}}')
  AND
    ${PROJECTS_USING_ALTERNATIVE_HIERARCHIES.map(p => `(NOT "projectCodes" @> '{${p}}')`).join(`
      AND
    `)};
`);

exports.up = async function (db) {
  await addVisualisationsToExplore(db, 'dashboardGroup');
  await addVisualisationsToExplore(db, 'mapOverlay');
};

exports.down = function (db) {
  // bit hard to go in reverse without listing out the prior state quite explicitly
  return null;
};

exports._meta = {
  version: 1,
};
