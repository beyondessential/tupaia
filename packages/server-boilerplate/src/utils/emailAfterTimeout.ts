import { sendEmail } from '@tupaia/server-utils';
import { UserAccount } from '@tupaia/types';
import { respond } from '@tupaia/utils';

type TemplateContext = {
  title: string;
  message: string;
  cta?: {
    text: string;
    url: string;
  };
};

type ConstructEmailFromResponseT = (
  responseBody: any,
  req: any,
) => Promise<{
  subject: string;
  attachments?: { filename: string; content: Buffer }[];
  templateContext: TemplateContext;
}>;

const sendResponseAsEmail = (
  user: UserAccount,
  subject: string,
  templateContext: TemplateContext,
  attachments?: { filename: string; content: Buffer }[],
) => {
  sendEmail(user.email, {
    subject,
    attachments,
    templateName: 'emailAfterTimeout',
    templateContext: {
      ...templateContext,
      userName: user.first_name,
    },
  });
};

const setupEmailResponse = async (
  req: any,
  res: any,
  constructEmailFromResponse: ConstructEmailFromResponseT,
) => {
  const { models } = req;
  const user = await models.user.findById(req.user.id, { columns: ['email', 'first_name'] });

  if (res.headersSent) {
    // no need to do anything if the endpoint handler responded successfully within the timeout
    // n.b. this check needs to stay below any async stuff above, so that we don't end up in a half
    // way state where the successful response happens e.g. during looking up the user
    return;
  }

  // If the request has a flagPermissionsChecked function, call it to bypass permissions
  if (req.flagPermissionsChecked) {
    req.flagPermissionsChecked(); // any permissions error will be emailed; bypass permissions assertion
  }
  // respond with timeout status
  respond(res, { emailTimeoutHit: true }, 200);

  // override the respond function so that when the endpoint handler finishes (or throws an error),
  // the response is sent via email
  res.overrideRespond = async (responseBody: any) => {
    const { subject, attachments, templateContext } = await constructEmailFromResponse(
      responseBody,
      req,
    );
    sendResponseAsEmail(user, subject, templateContext, attachments);
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
    const timeout = Number.parseInt(respondWithEmailTimeout, 10);
    if (Number.isNaN(timeout)) {
      throw new Error('respondWithEmailTimeout must be a number');
    }
    setTimeout(() => setupEmailResponse(req, res, constructEmailFromResponse), timeout);
    next();
  };
