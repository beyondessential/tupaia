import { sendEmail } from '@tupaia/server-utils';
import { fetchWithTimeout, getIsProductionEnvironment, requireEnv } from '@tupaia/utils';

const emailInternally = async (subject, message) => {
  const sendTo = requireEnv('DEV_EMAIL_ADDRESS');
  return sendEmail(sendTo, {
    subject,
    templateName: 'generic',
    templateContext: {
      userName: 'Tupaia Admin',
      message,
    },
  });
};

export const buildZendeskTicketRequest = ({ zendeskApi, apiToken, email, subject, message }) => {
  const url = `${zendeskApi}/tickets`;

  const ticket = {
    subject,
    comment: {
      body: message,
    },
  };

  const base64Credentials = Buffer.from(`${email}/token:${apiToken}`).toString('base64');

  return {
    url,
    requestInit: {
      method: 'POST',
      headers: {
        Authorization: `Basic ${base64Credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticket }),
    },
  };
};

export const createSupportTicket = async (subject, message) => {
  // If we are not in a production environment, send an email to the dev team instead of creating a support ticket
  if (!getIsProductionEnvironment()) {
    return emailInternally(subject, message);
  }

  // If ZENDESK_NOTIFICATIONS_DISABLE is set to true, do not create a support ticket
  if (process.env.ZENDESK_NOTIFICATIONS_DISABLE === 'true') return;

  try {
    const { url, requestInit } = buildZendeskTicketRequest({
      zendeskApi: requireEnv('ZENDESK_API_URL'),
      apiToken: requireEnv('ZENDESK_API_TOKEN'),
      email: requireEnv('ZENDESK_EMAIL'),
      subject,
      message,
    });

    await fetchWithTimeout(url, requestInit);
  } catch (error) {
    console.error('Error creating support ticket:', error);
  }
};
