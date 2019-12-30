'use strict';

import { insertObject } from '../migrationUtilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  await insertObject(db, 'mapOverlay', {
    name: 'Affected status',
    groupName: 'Disaster response',
    userGroup: 'Admin',
    displayType: 'color',
    isDataRegional: true,
    hideFromMenu: true,
    hideFromPopup: false,
    hideFromLegend: false,
    values: [
      { color: 'green', value: 0, name: 'Not affected' },
      { color: 'yellow', value: 1, name: 'Partially affected' },
      { color: 'red', value: 2, name: 'Completely affected' },
      { color: 'blue', value: 3, name: 'Not applicable' },
    ],
    dataElementCode: 'DP_NEW008',
  });

  const result = await db.runSql(`
    SELECT id FROM "mapOverlay"
      WHERE "dataElementCode" = 'DP_NEW008';
  `);
  const id = result.rows[0].id;

  await db.runSql(
    `
    UPDATE "mapOverlay"
      SET "linkedMeasures" = ?
    WHERE
      "groupName" = 'Disaster response'
      AND id != ?;
  `,
    [[id], id],
  );
};

exports.down = async function(db) {
  return db.runSql(`
    UPDATE "mapOverlay"
      SET "linkedMeasures" = NULL
    WHERE
      "groupName" = 'Disaster response';

    DELETE FROM "mapOverlay"
      WHERE "dataElementCode" = 'DP_NEW008';
  `);
};

exports._meta = {
  version: 1,
};
