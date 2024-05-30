/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { sendEmail } from '@tupaia/server-utils';
import { UserAccount } from '@tupaia/types';
import { respond } from '@tupaia/utils';

type ConstructEmailFromResponseT = (
  responseBody: any,
  req: any,
) => Promise<{
  subject: string;
  message: string;
  attachments?: { filename: string; content: Buffer }[];
}>;

const sendResponseAsEmail = (
  user: UserAccount,
  subject: string,
  message: string,
  attachments?: { filename: string; content: Buffer }[],
) => {
  console.log("Sending email to user's email address", user.email);
  const text = `Hi ${user.first_name},

${message}
  `;
  sendEmail(user.email, { subject, text, attachments });
};

const setupEmailResponse = async (
  req: any,
  res: any,
  constructEmailFromResponse: ConstructEmailFromResponseT,
) => {
  const { models } = req;
  const user = await models.user.findById(req.user.id);

  if (res.headersSent) {
    // no need to do anything if the endpoint handler responded successfully within the timeout
    // n.b. this check needs to stay below any async stuff above, so that we don't end up in a half
    // way state where the successful response happens e.g. during looking up the user
    return;
  }

  // respond with timeout status
  respond(res, { emailTimeoutHit: true }, 200);

  // override the respond function so that when the endpoint handler finishes (or throws an error),
  // the response is sent via email
  res.overrideRespond = async (responseBody: any) => {
    const { subject, message, attachments } = await constructEmailFromResponse(responseBody, req);
    sendResponseAsEmail(user, subject, message, attachments);
  };
};

// if the import takes too long, the results will be emailed
export const emailAfterTimeout =
  (constructEmailFromResponse: ConstructEmailFromResponseT) =>
  (req: any, res: any, next: () => void) => {
    const { respondWithEmailTimeout } = req.query;
    if (respondWithEmailTimeout === undefined) {
      next();
      return;
    }
    const timeout = parseInt(respondWithEmailTimeout, 10);
    if (Number.isNaN(timeout)) {
      throw new Error('respondWithEmailTimeout must be a number');
    }
    setTimeout(() => setupEmailResponse(req, res, constructEmailFromResponse), timeout);
    next();
  };
