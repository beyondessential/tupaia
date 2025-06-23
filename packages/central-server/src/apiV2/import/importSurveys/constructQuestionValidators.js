import { constructIsOneOf, hasContent, isNumber } from '@tupaia/utils';
import { ANSWER_TYPES } from '../../../database/models/Answer';
import { splitStringOnComma, splitOnNewLinesOrCommas } from '../../utilities';
import { convertCellToJson, isEmpty, isYesOrNo } from './utilities';

const DHIS_MAX_NAME_LENGTH = 230; // In DHIS2, the field is capped at 230 characters
const QUESTION_TYPES_WITH_OPTIONS = [
  ANSWER_TYPES.RADIO,
  ANSWER_TYPES.BINARY,
  ANSWER_TYPES.ENTITY,
  ANSWER_TYPES.PRIMARY_ENTITY,
];

const optionsValidators = [
  (cell, row) => {
    if (!isEmpty(cell) && !QUESTION_TYPES_WITH_OPTIONS.includes(row.type)) {
      throw new Error(`${row.type} type questions should not have content in options`);
    }
    return true;
  },
  (cell, row) => {
    if (
      row.type === ANSWER_TYPES.RADIO &&
      !isEmpty(cell) &&
      splitOnNewLinesOrCommas(cell).length <= 1
    ) {
      throw new Error('When defining options, include at least two separated by a comma');
    }
    return true;
  },
];

export const constructQuestionValidators = models => ({
  code: [
    (cell, row) => {
      // Not required for Instruction lines
      if (row.type === 'Instruction') {
        return true;
      }
      if (cell.includes('.')) {
        throw new Error('Question codes must not contain any periods (".")');
      }
      return hasContent(cell);
    },
  ],
  type: [hasContent, constructIsOneOf(Object.values(ANSWER_TYPES))],
  name: [
    (cell, questionObject) => {
      // Not required for Instruction lines
      if (questionObject.type === 'Instruction') {
        return true;
      }
      return hasContent(cell);
    },
    cell => {
      if (cell && cell.length > DHIS_MAX_NAME_LENGTH) {
        throw new Error(`Question names must be shorter than ${DHIS_MAX_NAME_LENGTH} characters`);
      }
      return true;
    },
  ],
  text: [hasContent],
  detail: [],
  optionSet: [
    (cell, row) => {
      if (row.type === 'Autocomplete' && isEmpty(cell)) {
        throw new Error('Autocomplete question types must have an Option Set');
      }
      if (row.type !== 'Autocomplete' && !isEmpty(cell)) {
        throw new Error('Option Set can only exist on Autocomplete question types');
      }
      return true;
    },
    cell => {
      if (!isEmpty(cell)) {
        const optionSet = models.optionSet.findOne({ name: cell });
        if (isEmpty(optionSet)) {
          throw new Error(`Option Set: "${cell}" does not exist`);
        }
      }
      return true;
    },
  ],
  options: [
    ...optionsValidators,
    (cell, row) => {
      if (row.type === 'Radio' && isEmpty(cell)) {
        throw new Error('All radio questions should have a defined list of options');
      }
      return true;
    },
    cell => {
      if (!isEmpty(cell) && splitOnNewLinesOrCommas(cell).some(option => option.length === 0)) {
        throw new Error('All options should be at least one character long');
      }
      return true;
    },
  ],
  optionLabels: [
    ...optionsValidators,
    (cell, row) => {
      if (row.type === 'Binary') {
        if (splitOnNewLinesOrCommas(cell).length > 2) {
          throw new Error('Only 2 labels are allowed for a Binary question');
        }
      } else if (
        splitOnNewLinesOrCommas(cell).length > splitOnNewLinesOrCommas(row.options).length
      ) {
        throw new Error('There are more labels than options.');
      }
    },
  ],
  optionColors: [
    ...optionsValidators,
    cell => {
      const stringFormat = '#xxxxxx';
      if (
        !isEmpty(cell) &&
        splitOnNewLinesOrCommas(cell).some(
          color => !color.startsWith('#') || color.length !== stringFormat.length,
        )
      ) {
        throw new Error(`Option colors must be valid hex values in the format ${stringFormat}`);
      }
      return true;
    },
  ],
  newScreen: [
    cell => {
      if (!isEmpty(cell) && !isYesOrNo(cell)) {
        throw new Error('The newScreen field should contain either Yes or No or be empty');
      }
      return true;
    },
  ],
  visibilityCriteria: [
    async cell => {
      if (isEmpty(cell)) {
        return true; // No follow up answers defined, so is valid
      }
      const criteria = Object.entries(convertCellToJson(cell, splitStringOnComma));
      for (let i = 0; i < criteria.length; i++) {
        const [questionCode, answers] = criteria[i];
        if (questionCode === '_conjunction') {
          if (answers.length !== 1 || !['and', 'or'].includes(answers[0])) {
            throw new Error('Visibility criteria conjunction must be either "and" or "or"');
          }
        } else if (questionCode === 'hidden') {
          if (answers.length !== 1 || !['true', 'false'].includes(answers[0])) {
            throw new Error('Visibility criteria hidden must be either "true" or "false"');
          }
        } else {
          const question = await models.question.findOne({ code: questionCode });
          if (!question) {
            throw new Error(`Question with code ${questionCode} does not exist`);
          }
          switch (question.type) {
            case 'Radio':
              if (
                !answers.every(answer =>
                  question.options.some(option => {
                    if (option === answer) {
                      return true;
                    }
                    // The option may be a JSON string in the form { value: x, ... }
                    try {
                      if (JSON.parse(option).value === answer) {
                        return true;
                      }
                    } catch (error) {
                      return false;
                    }
                    return false;
                  }),
                )
              ) {
                throw new Error(
                  'Every answer in the visibility criteria should be one of the options defined for the question',
                );
              }
              break;
            case 'Binary':
              if (!answers.every(answer => isYesOrNo(answer))) {
                throw new Error(
                  'All answers in the visibility criteria for binary questions should be either Yes or No',
                );
              }
              break;
            case 'Number':
              if (!answers.every(answer => !isNaN(answer))) {
                throw new Error(
                  'All answers in the visibility criteria for a number question should be numbers',
                );
              }
              break;
            default:
              return true;
          }
        }
      }
      return true;
    },
  ],
  validationCriteria: [
    (cell, row) => {
      const VALIDATION_CRITERIA_VALIDATORS = {
        mandatory: value => {
          if (!['true', 'false'].includes(value)) {
            throw new Error('The validation criteria "mandatory" must be either true or false');
          }
          if (value === 'true' && row.type === 'Instruction') {
            throw new Error('Instructions cannot have mandatory set to true');
          }
        },
        min: isNumber,
        max: isNumber,
      };
      if (isEmpty(cell)) {
        return true; // No validation criteria defined, so is valid
      }
      const criteria = Object.entries(convertCellToJson(cell));
      criteria.forEach(([key, value]) => {
        if (VALIDATION_CRITERIA_VALIDATORS[key] === undefined) {
          throw new Error(
            `Validation criteria can only be one of ${Object.keys(VALIDATION_CRITERIA_VALIDATORS)}`,
          );
        }
        VALIDATION_CRITERIA_VALIDATORS[key](value);
      });
      return true;
    },
  ],
  config: [
    (cell, row) => {
      if (row.type === ANSWER_TYPES.CODE_GENERATOR && isEmpty(cell)) {
        throw new Error(
          'CodeGenerator questions must have a configuration defined in the config column',
        );
      }
      return true;
    },
  ],
});
