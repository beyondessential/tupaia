'use strict';

import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

const OVERLAYS_TO_LIMIT = [
  // 'AU_FLUTRACKING_Participants_Per_100k', Don't hard limit participants per capita
  'AU_FLUTRACKING_Fever_And_Cough',
  'AU_FLUTRACKING_Fever_And_Cough_Causing_Absence',
  'AU_FLUTRACKING_Vaccination_Rate_Flu',
  'AU_FLUTRACKING_Vaccinated_With_Fever_And_Cough',
  'AU_FLUTRACKING_Sought_Medical_Advice',
  'AU_FLUTRACKING_Tested_For_Flu',
  'AU_FLUTRACKING_Tested_For_Covid',
  'AU_FLUTRACKING_Tested_Positive_For_Flu',
  'AU_FLUTRACKING_Tested_Positive_For_Covid',
  'AU_FLUTRACKING_LGA_Fever_And_Cough',
  'AU_FLUTRACKING_LGA_Fever_And_Cough_Causing_Absence',
  'AU_FLUTRACKING_LGA_Vaccination_Rate_Flu',
  'AU_FLUTRACKING_LGA_Vaccinated_With_Fever_And_Cough',
  'AU_FLUTRACKING_LGA_Sought_Medical_Advice',
  'AU_FLUTRACKING_LGA_Tested_For_Flu',
  'AU_FLUTRACKING_LGA_Tested_For_Covid',
  'AU_FLUTRACKING_LGA_Tested_Positive_For_Flu',
  'AU_FLUTRACKING_LGA_Tested_Positive_For_Covid',
];
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
  if (presentationOptions.scaleBounds.left.max || presentationOptions.scaleBounds.left.max === 0) {
    scaleBounds.left = {
      min: presentationOptions.scaleBounds.left.max,
      max: presentationOptions.scaleBounds.left.max,
    };
  }
  if (
    presentationOptions.scaleBounds.right.min ||
    presentationOptions.scaleBounds.right.min === 0
  ) {
    scaleBounds.right = {
      min: presentationOptions.scaleBounds.right.min,
      max: presentationOptions.scaleBounds.right.min,
    };
  }
  return scaleBounds;
};

exports.up = async function (db) {
  const overlays = await db.runSql(
    `select * from "mapOverlay" where id in (${arrayToDbString(OVERLAYS_TO_LIMIT)})`,
  );
  return Promise.all(
    overlays.rows.map(({ id, presentationOptions }) =>
      db.runSql(`
    UPDATE "mapOverlay"
    SET "presentationOptions" = jsonb_set("presentationOptions", '{scaleBounds}', '${JSON.stringify(
      makeScaleBoundsConfig(presentationOptions),
    )}')
    WHERE id = '${id}';
  `),
    ),
  );
};

exports.down = async function (db) {
  const overlays = await db.runSql(
    `select * from "mapOverlay" where id in (${arrayToDbString(OVERLAYS_TO_LIMIT)})`,
  );
  await Promise.all(
    overlays.rows.map(({ id, presentationOptions }) =>
      db.runSql(`
        UPDATE "mapOverlay"
        SET "presentationOptions" = jsonb_set("presentationOptions", '{scaleBounds}', '${JSON.stringify(
          {
            left: {
              max: presentationOptions.scaleBounds.left.max,
            },
            right: {
              min: presentationOptions.scaleBounds.right.min,
            },
          },
        )}')
        WHERE id = '${id}';
      `),
    ),
  );
};

exports._meta = {
  version: 1,
};
