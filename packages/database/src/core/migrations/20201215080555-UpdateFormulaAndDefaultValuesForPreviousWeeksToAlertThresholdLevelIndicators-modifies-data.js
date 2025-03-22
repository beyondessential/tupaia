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
  siteAverage1WeekAgo: 'undefined',
  siteAverage2WeeksAgo: 'undefined',
};
const PREVIOUS_THREE_WEEKS_DEFAULT_VALUES = {
  siteAverage1WeekAgo: 'undefined',
  siteAverage2WeeksAgo: 'undefined',
  siteAverage3WeeksAgo: 'undefined',
};

const PREVIOUS_TWO_WEEKS_THRESHOLD_FORMULA = '2 * avg(siteAverage1WeekAgo, siteAverage2WeeksAgo)';
const PREVIOUS_THREE_WEEKS_THRESHOLD_FORMULA =
  '2 * avg(siteAverage1WeekAgo, siteAverage2WeeksAgo, siteAverage3WeeksAgo)';

// Should affect these indicators
// "PSSS_Confirmed_DIA_Alert_Threshold_Level"
// "PSSS_DIA_Alert_Threshold_Level"
// "PSSS_DLI_Alert_Threshold_Level"
// "PSSS_Confirmed_DLI_Alert_Threshold_Level"
// "PSSS_ILI_Alert_Threshold_Level"
// "PSSS_Confirmed_ILI_Alert_Threshold_Level"
// "PSSS_PF_Alert_Threshold_Level"
// "PSSS_Confirmed_PF_Alert_Threshold_Level"
const psssIndicatorCode = (code, isConfirmed = false) => {
  const descriptor = isConfirmed ? 'PSSS_Confirmed' : 'PSSS';
  const indicatorCodeParts = [descriptor, code, 'Alert_Threshold_Level'];
  return indicatorCodeParts.join('_');
};

const addDefaultValuesForPreviousWeeksToIndicator = async (
  db,
  code,
  isConfirmed = false,
  isTwoWeeks = true,
) => {
  const indicatorCode = psssIndicatorCode(code, isConfirmed);
  const formula = isTwoWeeks
    ? PREVIOUS_TWO_WEEKS_THRESHOLD_FORMULA
    : PREVIOUS_THREE_WEEKS_THRESHOLD_FORMULA;
  const defaultValues = isTwoWeeks
    ? PREVIOUS_TWO_WEEKS_DEFAULT_VALUES
    : PREVIOUS_THREE_WEEKS_DEFAULT_VALUES;

  await db.runSql(`
      UPDATE indicator
      SET config = jsonb_set(config, '{formula}', '"${formula}"')
      WHERE code = '${indicatorCode}';
  `);
  await db.runSql(`
      UPDATE indicator
      SET config = config || '{"defaultValues": ${JSON.stringify(defaultValues)}}'
      WHERE code = '${indicatorCode}';
  `);
};

exports.up = async function (db) {
  await Promise.all(
    PREVIOUS_TWO_WEEKS_CODES.map(code =>
      Promise.all([
        addDefaultValuesForPreviousWeeksToIndicator(db, code),
        addDefaultValuesForPreviousWeeksToIndicator(db, code, true),
      ]),
    ),
  );

  await Promise.all(
    PREVIOUS_THREE_WEEKS_CODES.map(code =>
      Promise.all([
        addDefaultValuesForPreviousWeeksToIndicator(db, code, false, false),
        addDefaultValuesForPreviousWeeksToIndicator(db, code, true, false),
      ]),
    ),
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
