import {
  ImportValidationError,
  ObjectValidator,
  constructAtMostOneItem,
  constructIsNotPresentOr,
} from '@tupaia/utils';
import { convertCellToJson } from './utilities';
import { JsonFieldValidator } from './Validator/JsonFieldValidator';

export const SURVEY_METADATA = 'SurveyMetadata';

class SurveyMetadataConfigValidator extends JsonFieldValidator {
  static fieldName = 'config';

  getFieldValidators(rowIndex) {
    return {
      eventOrgUnit: [constructIsNotPresentOr(this.constructPointsToAnotherQuestion(rowIndex))],
    };
  }
}

export const validateSurveyMetadataRow = async (rows, rowIndex, constructFieldError) => {
  const isMetadataRow = ({ type }) => type === SURVEY_METADATA;
  const validateMetadataRowIsUnique = constructAtMostOneItem(isMetadataRow);

  try {
    await validateMetadataRowIsUnique(rows);
  } catch (error) {
    const excelRowNumber = rowIndex + 2; // +2 to make up for header and 0 index
    throw new ImportValidationError('Only one row can be of SurveyMetadata type', excelRowNumber);
  }

  const validateConfigField = async () =>
    new SurveyMetadataConfigValidator(rows).validate(rowIndex);
  const objectValidator = new ObjectValidator({
    config: [validateConfigField],
  });
  await objectValidator.validate(rows[rowIndex], constructFieldError);

  return true;
};

export const processSurveyMetadataRow = async (models, rows, rowIndex, surveyId) => {
  const { config } = rows[rowIndex];
  const { eventOrgUnit } = convertCellToJson(config);

  if (eventOrgUnit) {
    const survey = await models.survey.findById(surveyId);
    const { id: questionId } = await models.question.findOne({ code: eventOrgUnit });
    survey.integration_metadata.eventOrgUnit = { questionId };
    await survey.save();
  }
};
