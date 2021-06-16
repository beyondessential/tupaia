/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { sendEmail } from '../../utilities';
import { getFailureMessage } from './getFailureMessage';

const constructFailuresMessage = async failures => {
  const message = `Your survey response spreadsheet has finished processing, but some survey responses were not able to be imported. Please fix the following and try again:
${failures.map(failure => `  - ${getFailureMessage(failure)}`).join('\n')}

Note that any responses not listed here will have been successfully imported, so can be removed for your next attempt.`;
  return message;
};

const constructMessageBody = responseBody => {
  const { error, failures = [] } = responseBody;

  // global error, whole import has failed
  if (error) {
    return error;
  }

  // at least one response failed, but import finished processing
  if (failures.length > 0) {
    return constructFailuresMessage(failures);
  }

  return 'Your survey response spreadsheet has successfully been imported.';
};

const sendResponseAsEmail = (user, responseBody) => {
  const messageBody = constructMessageBody(responseBody);
  const message = `Hi ${user.first_name},

${messageBody}
  `;
  sendEmail(user.email, 'Tupaia Survey Response Import', message);
};

const setupEmailResponse = async (req, res) => {
  const { models, userId } = req;
  const user = await models.user.findById(userId);

  // no need to do anything if the response has already gone out, within the timeout
  // n.b. this check needs to stay below any async stuff above, so that we don't end up in a half
  // way state
  if (res.headersSent) {
    return;
  }

  respond(res, {
    message:
      'Import is taking a while, it will continue in the background and you will be emailed when complete',
  });
  // override the respond function so that when the import finishes (or a validation error is
  // thrown), the response is sent via email
  res.overrideRespond = responseBody => sendResponseAsEmail(user, responseBody);
};

// if the import takes too long, the results will be emailed
// this pattern could be utilised to wrap other endpoints quite easily
export const setupEmailResponseTimeout = (req, res) => {
  const { respondWithEmailTimeout } = req.query;
  if (respondWithEmailTimeout === undefined) {
    return;
  }
  const timeout = parseInt(respondWithEmailTimeout, 10);
  if (Number.isNaN(timeout)) {
    throw new Error('respondWithEmailTimeout must be a number');
  }
  setTimeout(() => setupEmailResponse(req, res), timeout);
};
