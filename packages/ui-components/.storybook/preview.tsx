import React from 'react';
import { Preview } from '@storybook/react';
import { ReactHookFormDecorator, ReactRouterDecorator, AppProviders } from '../helpers';

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
    ReactHookFormDecorator,
    ReactRouterDecorator,
  ],
};

export default preview;
