'use strict';

var dbm;
var type;
var seed;

import { generateId } from '../utilities';

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const PERMISSION_GROUP = 'Fiji Supply Chain';

const createReport = 

const createOverlay = 

const overlayGroupRecord = {
  id: generateId(),
  name: 'Laboratory Item Availability',
  code: 'FJ_SUPPLY_CHAIN_Laboratory_Item_Availability',
}

exports.up = function(db) {
  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
