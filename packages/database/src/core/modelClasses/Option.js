import { hasContent } from '@tupaia/utils';
import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class OptionRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.OPTION;

  static fieldValidators = new Map()
    .set('value', [
      value => {
        try {
          return hasContent(value) && null;
        } catch (error) {
          return error.message;
        }
      },
    ])
    .set('label', [
      async (label, model) => {
        if (label) {
          const foundConflict = await findFieldConflict('label', label, model);
          if (foundConflict) return 'Found duplicate label in option set';
        }
        return null;
      },
    ]);

  /**
   * @param {string} option
   * @returns {{label: string; value: string}}
   */
  static parseForClient(option) {
    try {
      const parsedOption = JSON.parse(option);
      if (!('value' in parsedOption)) {
        // Valid JSON but not a valid option object, e.g. '50'
        throw new Error('Options defined as an object must contain the value key at minimum');
      }
      return parsedOption;
    } catch (e) {
      return typeof option === 'string' ? { label: option, value: option } : option;
    }
  }

  async getSurveyIds() {
    const surveyScreens = await this.database.executeSql(
      `
       SELECT survey_screen.survey_id
       FROM survey_screen
       INNER JOIN survey_screen_component
         ON survey_screen_component.screen_id = survey_screen.id
       INNER JOIN question
         ON question.id = survey_screen_component.question_id
       INNER JOIN option_set
         ON option_set.id = question.option_set_id
       INNER JOIN option
         ON option.option_set_id = option_set.id
       WHERE option.id = ?
     `,
      this.id,
    );
    return surveyScreens.map(s => s.survey_id);
  }
}

export class OptionModel extends DatabaseModel {
  static syncDirection = SyncDirections.PULL_FROM_CENTRAL;

  get DatabaseRecordClass() {
    return OptionRecord;
  }

  /**
   * @param {import('@tupaia/types').OptionSet['id']} optionSetId
   * @returns {Promise<number | null>} `null` if and only if the option set has no options
   */
  async getLargestSortOrder(optionSetId) {
    const [{ max_sort_order }] = await this.database.executeSql(
      'SELECT MAX(sort_order) AS max_sort_order FROM option WHERE option_set_id = ?;',
      optionSetId,
    );
    return max_sort_order;
  }

  async buildSyncLookupQueryDetails() {
    return null;
  }
}

const findFieldConflict = async (field, valueToCompare, model) => {
  const conflictingOption = await model.otherModels.option.findOne({
    [field]: valueToCompare || null,
    option_set_id: model.option_set_id,
    id: {
      comparator: '!=',
      comparisonValue: model.id || null,
    },
  });
  return !!conflictingOption;
};
