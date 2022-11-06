'use strict';

import { TupaiaDatabase } from '../TupaiaDatabase';
import { replaceEnum } from '../utilities';

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

const currentEntityTypes = [
  'world',
  'project',
  'country',
  'district',
  'sub_district',
  'facility',
  'village',
  'case',
  'case_contact',
  'disaster',
  'school',
  'catchment',
  'sub_catchment',
  'field_station',
  'city',
  'individual',
  'sub_facility',
  'postcode',
  'household',
  'larval_habitat',
  'local_government',
  'medical_area',
  'nursing_zone',
  'fetp_graduate',
];

exports.up = async function () {
  const db = new TupaiaDatabase();
  await db.executeSql(`
    ALTER TYPE public.entity_type ADD VALUE 'wish_sub_district';
  `);
  return db.closeConnections();
};

exports.down = async function () {
  const db = new TupaiaDatabase();
  await replaceEnum(db, 'entity_type', currentEntityTypes);
  db.closeConnections();
};

exports._meta = {
  version: 1,
};
