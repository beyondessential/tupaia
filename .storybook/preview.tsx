import React from 'react';
import type { Preview } from '@storybook/react';
import { AppProviders } from './AppProviders';
import ReactRouterDecorator from './ReactRouterDecorator';
import ReactHookFormDecorator from './ReactHookFormDecorator';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'Dark',
      values: [
        { name: 'Dark', value: '#262834' },
        { name: 'Light', value: '#ffffff' },
      ],
    },
    theme: 'dark',
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    ReactRouterDecorator,
    ReactHookFormDecorator,
    (Story, { parameters }) => {
      return (
        <AppProviders params={parameters}>
          <Story />
        </AppProviders>
      );
    },
  ],
};

export default preview;
