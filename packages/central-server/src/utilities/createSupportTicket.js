/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { fetchWithTimeout, requireEnv } from '@tupaia/utils';

export const createSupportTicket = async (subject, message) => {
  try {
    // If ZENDESK_NOTIFICATIONS_DISABLE is set to true, do not create a support ticket

    if (process.env.ZENDESK_NOTIFICATIONS_DISABLE === 'true') return;

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
