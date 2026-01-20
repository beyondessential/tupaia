import { insertObject, arrayToDbString } from '../utilities';

('use strict');

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

const POSSIBLE_ANSWERS = [
  'Fiefia Sports',
  'Health Promoting Church',
  'Health Promoting School',
  'Health Promoting Workplace',
  'Healthy Cooking Show',
  'International Day Awareness',
  'Outbreak Awareness',
  'Outer Island Update',
  'Routine Awareness Program',
  'Specialist Team Visit',
  'Tobacco Enforcement',
  'Malimali',
  'Other',
];

const COLORS = [
  '#FC1D26',
  '#FD9155',
  '#C9811C',
  '#FEDD64',
  '#81D75E',
  '#0F7F3B',
  '#20C2CA',
  '#40B7FC',
  '#0A4EAB',
  '#8C5AFB',
  '#FD6AC4',
  '#D9D9D9',
  '#7B6AFD',
];

const REPORT_ID = 'TO_HPU_Number_Of_Broadcasts_By_Theme';

const generatePresentationOptionsFromPossibleAnswers = function () {
  const presentationOptions = {};

  POSSIBLE_ANSWERS.forEach((possibleAnswer, index) => {
    presentationOptions[possibleAnswer] = {
      color: COLORS[index],
    };
  });

  return presentationOptions;
};

const VIEW_JSON_CONFIG = {
  name: 'Number of broadcasts by theme',
  type: 'chart',
  chartType: 'pie',
  periodGranularity: 'one_year_at_a_time',
  valueType: 'fractionAndPercentage',
  presentationOptions: generatePresentationOptionsFromPossibleAnswers(),
};

const generateDataClassesFromPossibleAnswers = function () {
  const dataClasses = {};

  POSSIBLE_ANSWERS.forEach(possibleAnswer => {
    dataClasses[possibleAnswer] = {
      numerator: {
        dataValues: {
          HP209: possibleAnswer,
        },
      },
      denominator: {
        dataValues: {
          HP209: '*',
        },
      },
    };
  });

  return dataClasses;
};

const DATA_BUILDER_CONFIG = {
  dataClasses: generateDataClassesFromPossibleAnswers(),
  programCode: 'HP03',
};

const DATA_SERVICES = [{ isDataRegional: false }];

const DASHBOARD_REPORT = {
  id: REPORT_ID,
  dataBuilder: 'percentagesOfEventCounts',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON_CONFIG,
  dataServices: DATA_SERVICES,
};

const DASHBOARD_GROUPS = ['TO_Health_Promotion_Unit_Country'];

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', DASHBOARD_REPORT);

  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${REPORT_ID}}'
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUPS)})
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT_ID}';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUPS)});
  `);
};

exports._meta = {
  version: 1,
};
