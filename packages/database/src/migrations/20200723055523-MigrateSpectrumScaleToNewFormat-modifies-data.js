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
const makeScaleBoundsConfig = presentationOptions => {
  const scaleBounds = {};
  if (presentationOptions.scaleMin || presentationOptions.scaleMin === 0) {
    scaleBounds.left = {
      max: presentationOptions.scaleMin,
    };
  }
  if (presentationOptions.scaleMax || presentationOptions.scaleMax === 0) {
    scaleBounds.right = {
      min: presentationOptions.scaleMax,
    };
  }
  return scaleBounds;
};

exports.up = async function (db) {
  const overlays = await db.runSql(`select * from "mapOverlay"`);
  return Promise.all(
    overlays.rows.map(
      ({ id, presentationOptions }) =>
        (presentationOptions.scaleMax ||
          presentationOptions.scaleMin ||
          presentationOptions.scaleMax === 0 ||
          presentationOptions.scaleMin === 0) &&
        db.runSql(`
          UPDATE "mapOverlay"
          SET "presentationOptions" = jsonb_set("presentationOptions", '{scaleBounds}', '${JSON.stringify(
            makeScaleBoundsConfig(presentationOptions),
          )}')
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

exports.down = async function (db) {
  const overlays = await db.runSql(`select * from "mapOverlay"`);
  return Promise.all(
    overlays.rows.map(async ({ id, presentationOptions }) => {
      if (!presentationOptions.scaleBounds) return;
      if (
        presentationOptions.scaleBounds.left &&
        (presentationOptions.scaleBounds.left.max || presentationOptions.scaleBounds.left.max === 0)
      ) {
        await db.runSql(`
          UPDATE "mapOverlay"
          SET "presentationOptions" = jsonb_set("presentationOptions", '{scaleMin}', '${JSON.stringify(
            presentationOptions.scaleBounds.left.max,
          )}')
          WHERE id = '${id}';
        `);
      }
      if (
        presentationOptions.scaleBounds.right &&
        (presentationOptions.scaleBounds.right.min ||
          presentationOptions.scaleBounds.right.min === 0)
      ) {
        await db.runSql(`
          UPDATE "mapOverlay"
          SET "presentationOptions" = jsonb_set("presentationOptions", '{scaleMax}', '${JSON.stringify(
            presentationOptions.scaleBounds.right.min,
          )}')
          WHERE id = '${id}';
        `);
      }

      await db.runSql(`
        UPDATE "mapOverlay"
        SET "presentationOptions" = "presentationOptions" - 'scaleBounds'
        WHERE id = '${id}';
      `);
    }),
  );
};

exports._meta = {
  version: 1,
};
