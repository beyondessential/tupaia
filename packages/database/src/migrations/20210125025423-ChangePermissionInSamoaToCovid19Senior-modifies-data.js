'use strict';

import { updateValues } from '../utilities/migration';

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

const permission = 'COVID-19 Senior';

exports.up = async function (db) {
  await updateValues(
    db,
    'mapOverlay',
    { userGroup: permission },
    { id: 'COVID_WS_Home_Village_Of_Suspected_And_Confirmed_Cases' },
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
