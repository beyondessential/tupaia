'use strict';

import { createForeignKeyConfig } from '../utilities/migration';

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

const TABLE_NAME = 'ancestor_descendant_relation';

exports.up = async function (db) {
  await db.createTable(TABLE_NAME, {
    columns: {
      id: { type: 'text', primaryKey: true },
      entity_hierarchy_id: {
        type: 'text',
        notNull: true,
        foreignKey: createForeignKeyConfig(TABLE_NAME, 'entity_hierarchy_id', 'entity_hierarchy'),
      },
      ancestor_id: {
        type: 'text',
        notNull: true,
        foreignKey: createForeignKeyConfig(TABLE_NAME, 'ancestor_id', 'entity'),
      },
      descendant_id: {
        type: 'text',
        notNull: true,
        foreignKey: createForeignKeyConfig(TABLE_NAME, 'descendant_id', 'entity'),
      },
      generational_distance: { type: 'int', notNull: true },
    },
  });
  await db.addIndex(TABLE_NAME, `${TABLE_NAME}_ancestor_id_idx`, ['ancestor_id']);
  await db.addIndex(TABLE_NAME, `${TABLE_NAME}_descendant_id_idx`, ['descendant_id']);
};

exports.down = function (db) {
  return db.dropTable(TABLE_NAME);
};

exports._meta = {
  version: 1,
};
