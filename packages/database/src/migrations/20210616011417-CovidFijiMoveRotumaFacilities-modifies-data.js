'use strict';

import { codeToId, updateValues } from '../utilities';

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

const facilityCodes = ['FJ_205', 'FJ_206'];
const subDistrictCode = ['FJ_sdRotuma'];

exports.up = async function (db) {
  const subDistrictId = await codeToId(db, 'entity', subDistrictCode);

  const results = await Promise.all(
    facilityCodes.map(async facilityCode =>
      updateValues(
        db,
        'entity_relation',
        { parent_id: subDistrictId },
        { child_id: await codeToId(db, 'entity', facilityCode) },
      ),
    ),
  );
  return results;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
