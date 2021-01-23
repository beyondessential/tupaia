'use strict';

import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

const LAOS_SCHOOLS_COUNTRY_ID = '5d09ac4bf013d63ce9170d88';

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

const updateQuestion = async (db, code, newOptions) =>
  db.runSql(`
    update question
    set options = ARRAY[${arrayToDbString(newOptions)}],
    type = 'Binary'
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
      const newOptions = options.map(({ label, color }) => {
        let newOption = { label };
        if (color) {
          newOption = {
            ...newOption,
            color,
          };
        }

        return JSON.stringify(newOption);
      });

      await updateQuestion(db, code, newOptions);
    }
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
