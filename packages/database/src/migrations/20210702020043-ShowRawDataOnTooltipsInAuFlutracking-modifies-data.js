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

const denominator = 'Respondents';

const mapOverlaysMapping = [
  { id: 'AU_FLUTRACKING_LGA_Fever_And_Cough', numerator: 'Fever and cough' },
  {
    id: 'AU_FLUTRACKING_LGA_Fever_And_Cough_Causing_Absence',
    numerator: 'Fever and cough causing absence from normal activities',
  },
  { id: 'AU_FLUTRACKING_LGA_Vaccination_Rate_Flu', numerator: 'Flu vaccinated' },
  {
    id: 'AU_FLUTRACKING_LGA_Vaccinated_With_Fever_And_Cough',
    numerator: 'Flu vaccinated with fever and cough',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Sought_Medical_Advice',
    numerator: 'Participants who sought medical advice for fever and cough',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Tested_For_Flu',
    numerator: 'Participants with symptoms tested for flu',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Tested_For_Covid',
    numerator: 'Participants with symptoms tested for covid',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Tested_Positive_For_Flu',
    numerator: 'Participants with symptoms tested positive for flu',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Tested_Positive_For_Covid',
    numerator: 'Participants with symptoms tested positive for covid',
  },
];

exports.up = async function (db) {
  for (const { id, numerator } of mapOverlaysMapping) {
    const metadataOptions = {
      metadataTitles: { numerator, denominator },
      valueType: 'oneDecimalPlace',
    };
    await db.runSql(`
      UPDATE "mapOverlay"
      SET "presentationOptions" = "presentationOptions" || '${JSON.stringify({
        metadataOptions,
      })}'::jsonb
      WHERE id = '${id}'
    `);
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
