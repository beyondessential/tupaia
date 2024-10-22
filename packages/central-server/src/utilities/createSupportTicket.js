/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { fetchWithTimeout, getIsProductionEnvironment, requireEnv } from '@tupaia/utils';
import { sendEmail } from '@tupaia/server-utils';

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

export const createSupportTicket = async (subject, message) => {
  // If ZENDESK_NOTIFICATIONS_DISABLE is set to true, do not create a support ticket
  if (process.env.ZENDESK_NOTIFICATIONS_DISABLE === 'true') return;

  // If we are not in a production environment, send an email to the dev team instead of creating a support ticket
  if (!getIsProductionEnvironment()) {
    return emailInternally(subject, message);
  }

  try {
    const zendeskApi = requireEnv('ZENDESK_API_URL');
    const apiToken = requireEnv('ZENDESK_API_TOKEN');
    const email = requireEnv('ZENDESK_EMAIL');

    const url = `${zendeskApi}/tickets`;

    const ticketData = {
      subject,
      comment: {
        body: message,
      },
    };

    const base64Credentials = Buffer.from(`${email}/token:${apiToken}`).toString('base64');

    const requestConfig = {
      method: 'POST',
      headers: {
        Authorization: `Basic ${base64Credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticket: ticketData }),
    };

    await fetchWithTimeout(url, requestConfig);
  } catch (error) {
    console.error('Error creating support ticket:', error);
  }
};
