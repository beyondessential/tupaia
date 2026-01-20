'use strict';
/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.up = async function (db) {
  await db.addColumn('task', 'overdue_email_sent', {
    type: 'timestamp with time zone',
  });
};

exports.down = function (db) {
  return db.removeColumn('task', 'overdue_email_sent', {
    ifExists: true,
  });
};

exports._meta = {
  version: 1,
};
