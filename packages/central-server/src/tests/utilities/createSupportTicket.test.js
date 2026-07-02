import chai from 'chai';

import {
  buildZendeskTicketRequest,
  createSupportTicket,
} from '../../utilities/createSupportTicket';

const { expect } = chai;

describe('buildZendeskTicketRequest', () => {
  it('builds the Zendesk API request from ticket details and credentials', () => {
    const { url, requestInit } = buildZendeskTicketRequest({
      zendeskApi: 'test_value',
      apiToken: 'test_value',
      email: 'test_value',
      subject: 'test_subject',
      message: 'test_message',
    });

    expect(url).to.equal('test_value/tickets');
    expect(requestInit).to.deep.equal({
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from('test_value/token:test_value').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticket: { subject: 'test_subject', comment: { body: 'test_message' } },
      }),
    });
  });
});

describe('createSupportTicket', () => {
  const envKeys = [
    'IS_PRODUCTION_ENVIRONMENT',
    'CI_BUILD_ID',
    'ZENDESK_NOTIFICATIONS_DISABLE',
    'ZENDESK_API_URL',
    'ZENDESK_API_TOKEN',
    'ZENDESK_EMAIL',
  ];
  const originalEnv = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));

  afterEach(() => {
    envKeys.forEach(key => {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    });
  });

  it("should not create a support ticket if ZENDESK_NOTIFICATIONS_DISABLE is set to 'true'", async () => {
    process.env.IS_PRODUCTION_ENVIRONMENT = 'true';
    delete process.env.CI_BUILD_ID;
    process.env.ZENDESK_NOTIFICATIONS_DISABLE = 'true';
    delete process.env.ZENDESK_API_URL;
    delete process.env.ZENDESK_API_TOKEN;
    delete process.env.ZENDESK_EMAIL;

    await createSupportTicket('test_subject', 'test_message');
  });
});
