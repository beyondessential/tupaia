'use strict';

import { insertObject, generateId } from '../utilities';

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

const getOriginalId = (syndrome, map) => `PSSS_PW_${syndrome}_Syndrome_${map}`;
const getNewId = (syndrome, map) => `PSSS_${syndrome}_Syndrome_${map}`;

exports.up = async function (db) {
  for (const syndrome of syndromes) {
    for (const map of ['Heat_Map', 'Bubble_Radius']) {
      const newId = getNewId(syndrome, map);
      const originalId = getOriginalId(syndrome, map);
      await db.runSql(`
          UPDATE "mapOverlay" 
          SET "id" = '${newId}'
          WHERE "id" = '${originalId}';

          UPDATE "mapOverlay" 
          SET "countryCodes" = "countryCodes" || '{FJ}'
          WHERE "id" = '${newId}' and "id" not like '%CON%';

          UPDATE "map_overlay_group_relation" 
          SET "child_id" = '${newId}'
          WHERE "child_id" = '${originalId}';
        `);
    }
  }
};

exports.down = function (db) {};

exports._meta = {
  version: 1,
};
