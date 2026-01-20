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

const createFieldsConfig = entityConfig => {
  const { createNew, parentId, type: entityType, attributes, name, code } = entityConfig;
  if (!createNew) return undefined;
  // select only one field for field type
  const fieldConfig = { name, code, parentId, type: entityType[0], attributes };
  return fieldConfig;
};

const createFilterConfig = entityConfig => {
  const { createNew, parentId, grandparentId, type: entityType, attributes } = entityConfig;
  if (createNew) return undefined;
  // select only one field for field type
  const filterConfig = { parentId, grandparentId, type: entityType, attributes };
  return filterConfig;
};

exports.up = async function (db) {
  const { rows: screenComponents } = await db.runSql(
    `SELECT * FROM survey_screen_component WHERE config::text LIKE '%"entity"%'`,
  );

  for (const component of screenComponents) {
    const currentConfig = JSON.parse(component.config);

    const { createNew, generateQrCode, allowScanQrCode } = currentConfig.entity;

    const fields = createFieldsConfig(currentConfig.entity);
    const filter = createFilterConfig(currentConfig.entity);

    const newEntityConfig = { createNew, generateQrCode, allowScanQrCode, fields, filter };
    const newConfig = { ...currentConfig, entity: newEntityConfig };

    await db.runSql(
      `UPDATE survey_screen_component SET config = '${JSON.stringify(newConfig)}' WHERE id = '${
        component.id
      }'`,
    );
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
