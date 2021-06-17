/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { sendEmail } from '../../utilities';
import { getFailureMessage } from './getFailureMessage';

const constructFailuresMessage = failures => {
  const message = `Your survey responses have finished processing, but some were not able to be imported. Please fix the following and try again:
${failures.map(failure => `  - ${getFailureMessage(failure)}`).join('\n')}

Any responses not listed here have been successfully imported, and can be removed for your next attempt.`;
  return message;
};

const constructMessageBody = responseBody => {
  const { error, failures = [] } = responseBody;

  // global error, whole import has failed
  if (error) {
    return `Unfortunately, your survey response import failed.

${error}`;
  }

  // at least one response failed, but import finished processing
  if (failures.length > 0) {
    return constructFailuresMessage(failures);
  }

  return 'Your survey responses have been successfully imported.';
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

  if (res.headersSent) {
    // no need to do anything if the import responded successfully within the timeout
    // n.b. this check needs to stay below any async stuff above, so that we don't end up in a half
    // way state where the successful response happens e.g. during looking up the user
    return;
  }

  respond(res, {
    message:
      'Import is taking a while, and will continue in the background. You will be emailed when the import process completes.',
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
