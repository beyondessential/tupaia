/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { columnIndexToColumnCode } from '../utilities';
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
  `${sheetName}, Column ${columnIndexToColumnCode(columnIndex)}: Failed to ${getUpdateTypePart(
    type,
    surveyResponseId,
  )} with the error "${error}"`;
