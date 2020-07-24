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
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  const overlays = await db.runSql(
    `select * from "mapOverlay" where id in (${arrayToDbString(OVERLAYS_TO_LIMIT)})`,
  );
  return Promise.all(
    overlays.rows.map(({ id, presentationOptions }) =>
      db.runSql(`
    UPDATE "mapOverlay"
    SET "presentationOptions" = jsonb_set("presentationOptions", '{scale}', '${JSON.stringify({
      max: {
        fixed: presentationOptions.scale.max.floating,
      },
      min: {
        fixed: presentationOptions.scale.min.floating,
      },
    })}')
    WHERE id = '${id}';
  `),
    ),
  );
};

exports.down = async function(db) {
  const overlays = await db.runSql(
    `select * from "mapOverlay" where id in (${arrayToDbString(OVERLAYS_TO_LIMIT)})`,
  );
  return Promise.all(
    overlays.rows.map(({ id, presentationOptions }) =>
      db.runSql(`
        UPDATE "mapOverlay"
        SET "presentationOptions" = jsonb_set("presentationOptions", '{scale}', '${JSON.stringify({
          max: {
            floating: presentationOptions.scale.max.fixed,
          },
          min: {
            floating: presentationOptions.scale.min.fixed,
          },
        })}')
        WHERE id = '${id}';
      `),
    ),
  );
};

exports._meta = {
  version: 1,
};
