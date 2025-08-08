import {
  VIZ_TEST_TOOL_CHANNEL_ID,
  VIZ_TEST_TOOL_CHANNEL_NAME,
  messageSlack,
} from '../messageSlack';

type MessagePayload = { channel: string; blocks: Record<string, unknown>[]; text: string };
type UploadPayload = {
  channel_id: string;
  file: string;
  filename: string;
};

const messages: MessagePayload[] = [];
const uploads: UploadPayload[] = [];

jest.mock('@slack/web-api', () => ({
  WebClient: class {
    public readonly chat = {
      postMessage: async (messagePayload: MessagePayload) => {
        messages.push(messagePayload);
      },
    };

    public readonly files = {
      uploadV2: async (uploadPayload: UploadPayload) => {
        uploads.push(uploadPayload);
      },
    };
  },
}));

describe('messageSlack', () => {
  it('will send a message to slack', async () => {
    const results = {
      successes: 7,
      errors: ["bad_report - Oh no! Where's my tooth brush!?"],
      skipped: ['skipped_report'],
      total: 9,
    };
    const logFilePath = 'logs/results_12354.log';

    await messageSlack('Test results', results, logFilePath);

    const expectedBlocks = [
      {
        text: {
          emoji: true,
          text: 'Test results',
          type: 'plain_text',
        },
        type: 'header',
      },
      {
        type: 'divider',
      },
      {
        elements: [
          {
            elements: [
              {
                name: 'white_check_mark',
                type: 'emoji',
              },
              {
                text: ' Successes: 7',
                type: 'text',
              },
            ],
            type: 'rich_text_section',
          },
        ],
        type: 'rich_text',
      },
      {
        elements: [
          {
            elements: [
              {
                name: 'x',
                type: 'emoji',
              },
              {
                text: ' Errors: 1',
                type: 'text',
              },
            ],
            type: 'rich_text_section',
          },
        ],
        type: 'rich_text',
      },
      {
        elements: [
          {
            elements: [
              {
                name: 'warning',
                type: 'emoji',
              },
              {
                text: ' Skipped: 1',
                type: 'text',
              },
            ],
            type: 'rich_text_section',
          },
        ],
        type: 'rich_text',
      },
    ];

    const expectedText = `Test results:\n{"successes":7,"errors":["bad_report - Oh no! Where's my tooth brush!?"],"skipped":["skipped_report"],"total":9}`;

    expect(messages.length).toEqual(1);
    expect(messages[0]).toEqual({
      channel: VIZ_TEST_TOOL_CHANNEL_NAME,
      blocks: expectedBlocks,
      text: expectedText,
    });
    expect(uploads.length).toEqual(1);
    expect(uploads[0]).toEqual({
      channel_id: VIZ_TEST_TOOL_CHANNEL_ID,
      file: logFilePath,
      filename: 'results.log',
    });
  });
});
