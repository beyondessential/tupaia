/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { sendEmail } from '../../utilities';
import { columnIndexToColumnCode } from '../utilities';
import { CREATE, UPDATE, DELETE } from './SurveyResponseUpdateBatcher';

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

const getFailureMessage = ({ sheetName, surveyResponseId, type, columnIndex, error }) =>
  `${sheetName}, Column ${columnIndexToColumnCode(columnIndex)}: Failed to ${getUpdateTypePart(
    type,
    surveyResponseId,
  )} with the error "${error}"`;

export const emailResults = async (user, failures) => {
  // Compose message to send
  const message = `
  Hi ${user.first_name},

  Your survey response spreadsheet has finished processing${
    failures.length === 0 ? ', and all responses were successfully imported.' : '.'
  }

  ${
    failures.length > 0
      ? `
  Unfortunately some survey responses were not able to be imported. Please try the following again:
${failures.map(failure => `      - ${getFailureMessage(failure)}`).join('\n')}

  Note that any responses not listed here will have been successfully imported, so can be removed for your next attempt.`
      : ''
  }`;

  // Send the email
  sendEmail(user.email, 'Tupaia Survey Response Import', message);
};
