import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import sinon from 'sinon';
import proxyquire from 'proxyquire';

const fetchWithTimeoutStub = sinon.stub().resolves();
const requireEnvStub = sinon.stub().returns('test_value');

// Use proxyquire to replace 'fetchWithTimeout' with the stub - See [here](https://stackoverflow.com/a/52591287) for an explanation about why destructured imports can't be stubbed
const { createSupportTicket } = proxyquire('../../utilities/createSupportTicket', {
  '@tupaia/utils': {
    fetchWithTimeout: fetchWithTimeoutStub,
    requireEnv: requireEnvStub,
    getIsProductionEnvironment: () => true,
  },
});

describe('Create support ticket', () => {
  after(() => {
    // Reset the stub after each test
    fetchWithTimeoutStub.reset();
    requireEnvStub.reset();
  });
  it("should not create a support ticket if ZENDESK_NOTIFICATIONS_DISABLE is set to 'true'", async () => {
    process.env.ZENDESK_NOTIFICATIONS_DISABLE = 'true';
    await createSupportTicket('test_subject', 'test_message');
    sinon.assert.notCalled(fetchWithTimeoutStub);
  });

  it('should create a support ticket if ZENDESK_NOTIFICATIONS_DISABLE is not set to true', async () => {
    process.env.ZENDESK_NOTIFICATIONS_DISABLE = 'false';
    await createSupportTicket('test_subject', 'test_message');
    expect(fetchWithTimeoutStub).to.have.been.calledOnce;
    expect(fetchWithTimeoutStub).to.have.been.calledWith('test_value/tickets', {
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
