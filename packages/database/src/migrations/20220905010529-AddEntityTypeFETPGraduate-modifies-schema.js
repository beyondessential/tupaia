'use strict';

import { TupaiaDatabase } from '../TupaiaDatabase';

var dbm;
var type;
var seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function () {
  const db = new TupaiaDatabase();
  await db.executeSql(`
    ALTER TYPE public.entity_type ADD VALUE 'fetp_graduate';
  `);
  return db.closeConnections();
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
