import { WebClient } from '@slack/web-api';
import { requireEnv } from '@tupaia/utils';
import { TestResult } from './types';

export const VIZ_TEST_TOOL_CHANNEL_NAME = '#viz-test-tool';
export const VIZ_TEST_TOOL_CHANNEL_ID = 'C06U4A1MQQM';

let client: WebClient;

const initialiseClient = () => {
  client = new WebClient(requireEnv('SLACK_BOT_OAUTH_TOKEN'));
};

const buildMessageBlocks = (heading: string, { successes, errors, skipped }: TestResult) => [
  {
    type: 'header',
    text: {
      type: 'plain_text',
      text: heading,
      emoji: true,
    },
  },
  {
    type: 'divider',
  },
  {
    type: 'rich_text',
    elements: [
      {
        type: 'rich_text_section',
        elements: [
          {
            type: 'emoji',
            name: 'white_check_mark',
          },
          {
            type: 'text',
            text: ` Successes: ${successes}`,
          },
        ],
      },
    ],
  },
  {
    type: 'rich_text',
    elements: [
      {
        type: 'rich_text_section',
        elements: [
          {
            type: 'emoji',
            name: 'x',
          },
          {
            type: 'text',
            text: ` Errors: ${errors.length}`,
          },
        ],
      },
    ],
  },
  {
    type: 'rich_text',
    elements: [
      {
        type: 'rich_text_section',
        elements: [
          {
            type: 'emoji',
            name: 'warning',
          },
          {
            type: 'text',
            text: ` Skipped: ${skipped.length}`,
          },
        ],
      },
    ],
  },
];

export const messageSlack = async (heading: string, result: TestResult, logFilePath: string) => {
  if (!client) {
    initialiseClient();
  }

  const blocks = buildMessageBlocks(heading, result);
  const text = `${heading}:\n${JSON.stringify(result)}`;

  await client.chat.postMessage({
    channel: VIZ_TEST_TOOL_CHANNEL_NAME,
    blocks,
    text,
  });
  await client.files.uploadV2({
    channel_id: VIZ_TEST_TOOL_CHANNEL_ID,
    file: logFilePath,
    filename: 'results.log',
  });
};
