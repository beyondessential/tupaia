'use strict';

var dbm;
var type;
var seed;

const LAOS_SCHOOLS_COUNTRY_ID = '5d09ac4bf013d63ce9170d88';

// List of Radio questions with only YesNo options (and labels) which will be migrated to Binary questions
/**
 * 'BCD29_event',
 * 'BCD32_event',
 * 'LaosO23',
 * 'LaosO24',
 * 'LaosO26',
 * 'LaosO27',
 * 'SchCVD004b',
 * 'SchCVD006',
 * 'SchCVD007',
 * 'SchCVD010a',
 * 'SchCVD010b',
 * 'SchCVD010c',
 * 'SchCVD010d',
 * 'SchCVD010e',
 * 'SchCVD010f',
 * 'SchCVD010g',
 * 'SchCVD010h',
 * 'SchCVD010i',
 * 'SchCVD010l',
 * 'SchCVD012',
 * 'SchCVD012a',
 * 'SchCVD012b',
 * 'SchCVD013',
 * 'SchCVD015',
 * 'SchCVD016',
 * 'SchCVD016a',
 * 'SchCVD016b',
 * 'SchCVD016c',
 * 'SchCVD017',
 * 'SchCVD017a',
 * 'SchCVD017b',
 * 'SchCVD017c',
 * 'SchCVD017d',
 * 'SchCVD019',
 * 'SchCVD020',
 * 'SchCVD022',
 * 'SchCVD022l',
 * 'SchCVD024',
 * 'SchCVD028',
 * 'SchDP_AEAL',
 * 'SchDP_CRS',
 * 'SchDP_HII',
 * 'SchDP_Plan',
 * 'SchDP_RtR',
 * 'SchDP_UNICEF',
 * 'SchDP_WB',
 * 'SchDP_WC',
 * 'SchDP_WFP',
 * 'SchDP_WR',
 * 'SchDP_WV',
 * 'SchFF001',
 * 'SchFF002',
 * 'SchFF004',
 * 'SchFF011',
 * 'SchQuar001'
 */

// List of surveys that the questions aboved are included (All Laos Schools surveys)
/**
 * 'Laos O2 Survey',
 * 'School COVID-19 Response DL',
 * 'School COVID-19 Response Laos',
 * 'School Dev Partners Laos',
 * 'School Electricity Laos',
 * 'School Fundamentals DL (obsolete)',
 * 'School Fundamentals Laos (obsolete)',
 * 'School Quarantine Laos',
 * 'School WASH Laos',
 * 'School Water Supply Laos'
 */

const selectLaosSchoolsRadioQuestionsOptions = async db =>
  db.runSql(`
    select distinct question.code, question.options
    from question 
    inner join survey_screen_component on survey_screen_component.question_id = question.id
    inner join survey_screen on survey_screen.id = survey_screen_component.screen_id
    inner join survey on survey.id = survey_screen.survey_id
    where question.type = 'Radio'
    and survey.country_ids::text = '{${LAOS_SCHOOLS_COUNTRY_ID}}'
    `);

const updateQuestion = async (db, code) =>
  db.runSql(`
    update question
    set type = 'Binary'
    where code = '${code}';
`);

const isYesNoRadioQuestion = options => {
  if (options.length !== 2) {
    return false;
  }

  const [firstOption, secondOption] = options;

  if (
    ((firstOption.value === 'Yes' && secondOption.value === 'No') ||
      (firstOption.value === 'No' && secondOption.value === 'Yes')) &&
    firstOption.label &&
    secondOption.label
  ) {
    return true;
  }

  return false;
};

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
  const { rows } = await selectLaosSchoolsRadioQuestionsOptions(db);

  for (const row of rows) {
    const { code, options: optionStringArray } = row;
    let options;

    try {
      options = optionStringArray.map(optionString => JSON.parse(optionString));
    } catch (e) {
      // option is not a JSON string, skip
      continue;
    }

    if (isYesNoRadioQuestion(options)) {
      await updateQuestion(db, code);
    }
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
