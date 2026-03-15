'use strict';

import { pascal } from 'case';
import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

const FLUTRACKING_OVERLAYS = [
  'AU_FLUTRACKING_Participants_Per_100k',
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

const deleteEntityTypes = async (db, id, configPath) => {
  await db.runSql(`
    update "mapOverlay"
    set "measureBuilderConfig" = "measureBuilderConfig" #- '{${configPath}aggregationEntityType}'
    where id='${id}';
  `);
};

const addMeasureLevelToPresentationOptions = async (db, id, measureLevel) => {
  const pascalMeasureLevel = pascal(measureLevel);
  await db.runSql(`
    update "mapOverlay"
    set "presentationOptions" = jsonb_set("presentationOptions", '{measureLevel}', '"${pascalMeasureLevel}"')
    where id='${id}';
  `);
};

exports.up = async function (db) {
  const allOverlays = (
    await db.runSql(
      `select * from "mapOverlay" where id in (${arrayToDbString(FLUTRACKING_OVERLAYS)})`,
    )
  ).rows;
  return Promise.all(
    allOverlays.map(async ({ id, measureBuilderConfig }) => {
      const globalAggregationEntityType = measureBuilderConfig.aggregationEntityType;

      await addMeasureLevelToPresentationOptions(db, id, globalAggregationEntityType);
      await deleteEntityTypes(db, id, '');
    }),
  );
};

exports.down = async function (db) {
  // No down function
};

exports._meta = {
  version: 1,
};
