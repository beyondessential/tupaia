import React from 'react';
import { AppProviders } from './AppProviders';
import { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#FFFFFF',
        },
        {
          name: 'dark',
          value: '#252934',
        },
      ],
    },
  },
  decorators: [
    // 👇 Defining the decorator in the preview file applies it to all stories
    (Story, { parameters }) => (
      <AppProviders params={parameters}>
        <Story />
      </AppProviders>
    ),
  ],
};

export default preview;
