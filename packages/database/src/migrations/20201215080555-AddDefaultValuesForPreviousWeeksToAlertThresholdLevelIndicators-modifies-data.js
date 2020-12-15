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

const PREVIOUS_TWO_WEEKS_CODES = ['DIA', 'ILI', 'PF'];
const PREVIOUS_THREE_WEEKS_CODES = ['DLI'];

const PREVIOUS_TWO_WEEKS_DEFAULT_VALUES = {
  siteAverage1WeekAgo: 0,
  siteAverage2WeeksAgo: 0
};
const PREVIOUS_THREE_WEEKS_DEFAULT_VALUES = {
  siteAverage1WeekAgo: 0,
  siteAverage2WeeksAgo: 0,
  siteAverage3WeeksAgo: 0
};

const psssIndicatorCode = (code, isConfirmed = false) => {
  const descriptor = isConfirmed ? 'PSSS_Confirmed' : 'PSSS';
  const indicatorCodeParts = [descriptor, code, 'Alert_Threshold_Level'];
  return indicatorCodeParts.join('_'); 
};

const addDefaultValuesForPreviousWeeksToIndicator = (db, code, isConfirmed = false, isTwoWeeks = true) => {
  const indicatorCode = psssIndicatorCode(
    code,
    isConfirmed,
  );
  const defaultValues = isTwoWeeks ? PREVIOUS_TWO_WEEKS_DEFAULT_VALUES : PREVIOUS_THREE_WEEKS_DEFAULT_VALUES;
  
  return db.runSql(`
      UPDATE indicator
      SET config = config || '{"defaultValues": ${JSON.stringify(defaultValues)}}'
      WHERE code = '${indicatorCode}';
  `);
};

exports.up = async function (db) {
  await Promise.all(
    PREVIOUS_TWO_WEEKS_CODES.map(code =>
      Promise.all([addDefaultValuesForPreviousWeeksToIndicator(db, code), addDefaultValuesForPreviousWeeksToIndicator(db, code, true)]),
    ),
  );

  await Promise.all(
    PREVIOUS_THREE_WEEKS_CODES.map(code =>
      Promise.all([addDefaultValuesForPreviousWeeksToIndicator(db, code, false, false), addDefaultValuesForPreviousWeeksToIndicator(db, code, true, false)]),
    ),
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
