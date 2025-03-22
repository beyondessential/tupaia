'use strict';

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

exports.up = async function (db) {
  await db.createTable('dashboard_mailing_list', {
    columns: {
      id: { type: 'text', primaryKey: true },
      project_id: {
        type: 'text',
        notNull: true,
        foreignKey: {
          name: `dashboard_mailing_list_project_id_fk`,
          table: 'project',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          mapping: 'id',
        },
      },
      entity_id: {
        type: 'text',
        notNull: true,
        foreignKey: {
          name: `dashboard_mailing_list_entity_id_fk`,
          table: 'entity',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          mapping: 'id',
        },
      },
      dashboard_id: {
        type: 'text',
        notNull: true,
        foreignKey: {
          name: `dashboard_mailing_list_dashboard_id_fk`,
          table: 'dashboard',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          mapping: 'id',
        },
      },
    },
    ifNotExists: true,
  });
  await db.createTable('dashboard_mailing_list_entry', {
    columns: {
      id: { type: 'text', primaryKey: true },
      dashboard_mailing_list_id: {
        type: 'text',
        notNull: true,
        foreignKey: {
          name: `dashboard_mailing_list_entry_dashboard_mailing_list_id_fk`,
          table: 'dashboard_mailing_list',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          mapping: 'id',
        },
      },
      email: { type: 'text', notNull: true },
      subscribed: { type: 'boolean', defaultValue: true, notNull: true },
      unsubscribed_time: { type: 'timestamp' },
    },
    ifNotExists: true,
  });
  await db.runSql(
    `ALTER TABLE dashboard_mailing_list ADD CONSTRAINT dashboard_id_project_id_entity_id_unique UNIQUE (dashboard_id, project_id, entity_id)`,
  );
  await db.runSql(
    `ALTER TABLE dashboard_mailing_list_entry ADD CONSTRAINT dashboard_mailing_list_id_email_unique UNIQUE (dashboard_mailing_list_id, email)`,
  );
};

exports.down = async function (db) {
  await db.runSql(`DROP TABLE IF EXISTS dashboard_mailing_list_entry`);
  await db.runSql(`DROP TABLE IF EXISTS dashboard_mailing_list`);
};

exports._meta = {
  version: 1,
};
