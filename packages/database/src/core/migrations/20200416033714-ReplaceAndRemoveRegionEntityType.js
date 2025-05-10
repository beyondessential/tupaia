'use strict';

import { replaceEnum } from '../utilities/migration';

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

const entityTypes = {
  old: [
    'world',
    'project',
    'country',
    'region',
    'facility',
    'village',
    'case',
    'case_contact',
    'disaster',
  ],
  new: [
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
  ],
};

const addEntityTypes = (db, types) =>
  Promise.all(
    types.map(type => db.runSql(`ALTER TYPE entity_type ADD VALUE IF NOT EXISTS '${type}';`)),
  );

const replaceRegionWithSubDistrictForNestedRegions = db =>
  db.runSql(`
    UPDATE
      entity
    SET
      type = 'sub_district'
    WHERE
      entity.parent_id IN (
        SELECT id FROM entity parent WHERE parent.id = entity.parent_id AND parent.type = 'region'
      )
      AND type = 'region';
`);

exports.up = async function (db) {
  await addEntityTypes(db, ['district', 'sub_district']);
  await replaceRegionWithSubDistrictForNestedRegions(db);
  await db.runSql(`UPDATE entity SET type = 'district' WHERE type = 'region';`);
  await replaceEnum(db, 'entity_type', entityTypes.new);
};

exports.down = async function (db) {
  await addEntityTypes(db, ['region']);
  await db.runSql(
    `UPDATE entity SET type = 'region' WHERE type IN ('district', 'sub_district');`,
  );
  await replaceEnum(db, 'entity_type', entityTypes.old);
};

exports._meta = {
  version: 1,
};
