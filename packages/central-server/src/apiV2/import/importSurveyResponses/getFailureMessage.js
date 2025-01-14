import { columnIndexToCode } from '../../utilities';
import { CREATE, UPDATE, DELETE } from './SurveyResponseUpdatePersistor';

const getUpdateTypePart = (type, surveyResponseId) => {
  switch (type) {
    case CREATE:
      return 'create new response';
    case UPDATE:
      return `update existing response ${surveyResponseId}`;
    case DELETE:
      return `delete existing response ${surveyResponseId}`;
    default:
      return '';
  }
};

export const getFailureMessage = ({ sheetName, surveyResponseId, type, columnIndex, error }) =>
  `${sheetName}, Column ${columnIndexToCode(columnIndex)}: Failed to ${getUpdateTypePart(
    type,
    surveyResponseId,
  )} with the error "${error}"`;
