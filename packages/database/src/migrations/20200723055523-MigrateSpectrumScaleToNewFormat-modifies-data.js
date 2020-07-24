'use strict';

import { arrayToDbString } from '../utilities';

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

exports.up = async function(db) {
  const overlays = await db.runSql(`select * from "mapOverlay"`);
  return Promise.all(
    overlays.rows.map(
      ({ id, presentationOptions }) =>
        (presentationOptions.scaleMax || presentationOptions.scaleMin) &&
        db.runSql(`
        UPDATE "mapOverlay"
        SET "presentationOptions" = jsonb_set("presentationOptions", '{scale}', '${JSON.stringify({
          max: {
            floating: presentationOptions.scaleMax,
          },
          min: {
            floating: presentationOptions.scaleMin,
          },
        })}')
        WHERE id = '${id}';

        UPDATE "mapOverlay"
        SET "presentationOptions" = "presentationOptions" - 'scaleMin'
        WHERE id = '${id}';

        UPDATE "mapOverlay"
        SET "presentationOptions" = "presentationOptions" - 'scaleMax'
        WHERE id = '${id}';
      `),
    ),
  );
};

exports.down = async function(db) {
  const overlays = await db.runSql(`select * from "mapOverlay"`);
  return Promise.all(
    overlays.rows.map(async ({ id, presentationOptions }) => {
      if (!presentationOptions.scale) return;
      if (presentationOptions.scale.min.floating) {
        await db.runSql(`
          UPDATE "mapOverlay"
          SET "presentationOptions" = jsonb_set("presentationOptions", '{scaleMin}', '${JSON.stringify(
            presentationOptions.scale.min.floating,
          )}')
          WHERE id = '${id}';
        `);
      }
      if (presentationOptions.scale.max.floating) {
        await db.runSql(`
          UPDATE "mapOverlay"
          SET "presentationOptions" = jsonb_set("presentationOptions", '{scaleMax}', '${JSON.stringify(
            presentationOptions.scale.max.floating,
          )}')
          WHERE id = '${id}';
        `);
      }

      await db.runSql(`
        UPDATE "mapOverlay"
        SET "presentationOptions" = "presentationOptions" - 'scale'
        WHERE id = '${id}';
      `);
    }),
  );
};

exports._meta = {
  version: 1,
};
