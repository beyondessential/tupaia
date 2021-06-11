/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { sendEmail } from '../../utilities';
import { columnIndexToColumnCode } from '../utilities';
import { CREATE, UPDATE, DELETE } from './SurveyResponseUpdateBatcher';

const getFailureMessageForType = type => {
  switch (type) {
    case CREATE:
      return 'failed to create new response';
    case UPDATE:
      return 'failed to update existing response';
    case DELETE:
      return 'failed to delete existing response';
    default:
      return '';
  }
};

export const processUpdatesAndEmail = async (models, updateBatcher, userId) => {
  const { failures } = await updateBatcher.processInBatches();
  const user = await models.user.findById(userId);

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
${failures
  .map(
    ({ sheetName, surveyResponseId, type, columnIndex }) =>
      `      - ${sheetName}, ${columnIndexToColumnCode(
        columnIndex,
      )}, ${surveyResponseId} (${getFailureMessageForType(type)})`,
  )
  .join('\n')}

  Note that any responses not listed here will have been successfully imported, so can be removed for your next attempt.`
      : ''
  }`;

  // Send the email
  sendEmail(user.email, 'Tupaia Survey Response Import', message);
};
