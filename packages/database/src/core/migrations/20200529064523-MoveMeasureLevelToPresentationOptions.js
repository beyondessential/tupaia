'use strict';

import { pascal, snake } from 'case';

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
  const allOverlays = (await db.runSql(`select * from "mapOverlay"`)).rows;
  return Promise.all(
    allOverlays.map(async ({ id, measureBuilderConfig, presentationOptions }) => {
      const type = pascal(measureBuilderConfig.aggregationEntityType);
      if (type) {
        await db.runSql(`
          update "mapOverlay"
          set "presentationOptions" = ${
            presentationOptions
              ? `jsonb_set("presentationOptions", '{measureLevel}', '"${type}"')`
              : `'{ "measureLevel": "${type}" }'`
          }
          where id='${id}';
        `);
        return db.runSql(`
          update "mapOverlay"
          set "measureBuilderConfig" = "measureBuilderConfig" - 'aggregationEntityType'
          where id='${id}';
        `);
      }
    }),
  );
};

exports.down = async function (db) {
  const allOverlays = (await db.runSql(`select * from "mapOverlay"`)).rows;
  return Promise.all(
    allOverlays.map(async ({ id, presentationOptions }) => {
      const type = snake(presentationOptions && presentationOptions.measureLevel);
      if (type) {
        await db.runSql(`
          update "mapOverlay"
          set "measureBuilderConfig" = jsonb_set("measureBuilderConfig", '{aggregationEntityType}', '"${type}"')
          where id='${id}';
        `);
        return db.runSql(`
          update "mapOverlay"
          set "presentationOptions" = "presentationOptions" - 'measureLevel'
          where id='${id}';
        `);
      }
      console.log('Failure: ', type, id);
    }),
  );
};

exports._meta = {
  version: 1,
};
