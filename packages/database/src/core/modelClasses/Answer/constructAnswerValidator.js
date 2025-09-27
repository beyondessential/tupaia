import {
  constructIsEmptyOr,
  constructIsOneOf,
  constructRecordExistsWithId,
  hasNoContent,
  isNumber,
  takesDateForm,
} from '@tupaia/utils';
import { AnswerModel } from './Answer';

function getValuesFromOptions(options) {
  return options.map(option => {
    try {
      // If the option is a preconfigured object defining value, label, color, just return the value
      const optionObject = JSON.parse(option);
      if (optionObject.value) {
        return optionObject.value;
      }
    } catch (error) {
      // Not parsable, the option must just be a simple string
    }
    // It is not a preconfigured object defining the value, so just return the string as is
    return option;
  });
}

export function constructAnswerValidator(models, question) {
  const {
    BINARY,
    CHECKBOX,
    FREE_TEXT,
    GEOLOCATE,
    INSTRUCTION,
    NUMBER,
    PHOTO,
    RADIO,
    DATE,
    DATE_OF_DATA,
    DAYS_SINCE,
    MONTHS_SINCE,
    YEARS_SINCE,
    SUBMISSION_DATE,
    AUTOCOMPLETE,
    PRIMARY_ENTITY,
    ENTITY,
    FILE,
  } = AnswerModel.types;
  switch (question.type) {
    case BINARY:
    case CHECKBOX:
      return [constructIsEmptyOr(constructIsOneOf(['Yes', 'No']))];
    case RADIO:
      return [constructIsEmptyOr(constructIsOneOf(getValuesFromOptions(question.options)))];
    case NUMBER:
    case DAYS_SINCE:
    case MONTHS_SINCE:
    case YEARS_SINCE:
      return [constructIsEmptyOr(isNumber)];
    case DATE_OF_DATA:
    case SUBMISSION_DATE:
    case DATE:
      return [constructIsEmptyOr(takesDateForm)];
    case INSTRUCTION:
    case PRIMARY_ENTITY:
      return [hasNoContent];
    case ENTITY:
      return [constructIsEmptyOr(constructRecordExistsWithId(models.entity))];
    case PHOTO: // TODO: Should be a url
    case GEOLOCATE: // TODO: Contain lat, long, accuracy
    case AUTOCOMPLETE: // TODO: Match options in option set
    case FREE_TEXT: // Ok with no validation, any text is fine
    case FILE: // TODO: what should the validation be?
    default:
      return [];
  }
}
