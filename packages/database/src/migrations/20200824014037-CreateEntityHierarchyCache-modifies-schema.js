'use strict';

import { createForeignKeyConfig } from '../utilities/migration';

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

const TABLE_NAME = 'ancestor_descendant_relation';

exports.up = async function(db) {
  await db.createTable(TABLE_NAME, {
    columns: {
      id: { type: 'text', primaryKey: true },
      hierarchy_id: {
        type: 'text',
        notNull: true,
        // foreignKey: createForeignKeyConfig(TABLE_NAME, 'hierarchy_id', 'entity_hierarchy'),
      },
      ancestor_id: {
        type: 'text',
        notNull: true,
        // foreignKey: createForeignKeyConfig(TABLE_NAME, 'ancestor_id', 'entity'),
      },
      ancestor_code: {
        type: 'text',
        notNull: true,
        // foreignKey: createForeignKeyConfig(TABLE_NAME, 'ancestor_code', 'entity', 'code'),
      },
      ancestor_type: {
        type: 'text',
        notNull: true,
      },
      descendant_id: {
        type: 'text',
        notNull: true,
        // foreignKey: createForeignKeyConfig(TABLE_NAME, 'descendant_id', 'entity'),
      },
      descendant_code: {
        type: 'text',
        notNull: true,
        // foreignKey: createForeignKeyConfig(TABLE_NAME, 'descendant_code', 'entity', 'code'),
      },
      descendant_type: { type: 'text', notNull: true },
    },
  });
  // await db.addIndex(TABLE_NAME, `${TABLE_NAME}_hierarchy_id_ancestor_id_descendant_type_idx`, [
  //   'hierarchy_id',
  //   'ancestor_id',
  //   'descendant_type',
  // ]);
  // await db.addIndex(TABLE_NAME, `${TABLE_NAME}_hierarchy_id_descendant_id_ancestor_type_idx`, [
  //   'hierarchy_id',
  //   'descendant_id',
  //   'ancestor_type',
  // ]);
};

exports.down = function(db) {
  return db.dropTable(TABLE_NAME);
};

exports._meta = {
  version: 1,
};
