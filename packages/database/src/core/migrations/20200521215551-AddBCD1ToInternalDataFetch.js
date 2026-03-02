'use strict';

import { generateId } from '../utilities';

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

const oldValues = [
  { icon: 'circle', name: 'Open', value: ['0', '1'] },
  { icon: 'x', name: 'Temporarily closed', value: '2' },
  { icon: 'triangle', name: 'Permanently closed', value: '3' },
  { icon: 'empty', name: 'No data', value: 'null' },
];

const newValues = [
  {
    icon: 'circle',
    name: 'Open',
    value: ['Fully Operational', 'Operational but closed this week'],
  },
  { icon: 'x', name: 'Temporarily closed', value: 'Temporarily Closed' },
  { icon: 'triangle', name: 'Permanently closed', value: 'Permanently Closed' },
  { icon: 'empty', name: 'No data', value: 'null' },
];

const mapOverlayId = 126;

exports.up = function (db) {
  return db.runSql(`
    INSERT INTO data_source (id, code, type, service_type)
    VALUES ('${generateId()}', 'BCD1', 'dataElement', 'tupaia');

    UPDATE "mapOverlay"
    SET
      "values" = '${JSON.stringify(newValues)}',
      "measureBuilderConfig" = "measureBuilderConfig" || '{"dataSourceEntityType":"facility"}'
    WHERE "id" = '${mapOverlayId}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM data_source
    WHERE code = 'BCD1'
    AND type = 'dataElement';

    UPDATE "mapOverlay"
    SET
      "values" = '${JSON.stringify(oldValues)}',
      "measureBuilderConfig" = "measureBuilderConfig" - 'dataSourceEntityType'
    WHERE "id" = '${mapOverlayId}';
  `);
};

exports._meta = {
  version: 1,
};
