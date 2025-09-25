'use strict';

import SubDistricts from './migrationData/20220520063938-ExcludeBetioFromCovidKiribatiProject-modifies-data/kiribati-subdistrict.json';
import { generateId, insertObject, nameToId, deleteObject } from '../utilities';

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

const PROJECT_CODE = 'covid_kiribati';
const subDistrictsExcludingBetio = SubDistricts.filter(sd => sd.name !== 'Betio');

exports.up = async function (db) {
  const hierarchyId = await nameToId(db, 'entity_hierarchy', PROJECT_CODE);
  for (const entity of subDistrictsExcludingBetio) {
    insertObject(db, 'entity_relation', {
      id: generateId(),
      child_id: entity.id,
      parent_id: entity.parent_id,
      entity_hierarchy_id: hierarchyId,
    });
  }
};

exports.down = async function (db) {
  const hierarchyId = await nameToId(db, 'entity_hierarchy', PROJECT_CODE);
  for (const entity of subDistrictsExcludingBetio) {
    deleteObject(db, 'entity_relation', {
      child_id: entity.id,
      entity_hierarchy_id: hierarchyId,
    });
  }
};

exports._meta = {
  version: 1,
};
