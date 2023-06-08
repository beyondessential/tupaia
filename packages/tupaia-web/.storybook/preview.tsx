import React from 'react';
import type { Preview } from '@storybook/react';
import { AppStyleProviders } from '../src/AppStyleProviders';
import ReactRouterDecorator from './ReactRouterDecorator';
const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'Dark',
      values: [
        { name: 'Dark', value: '#135D8F' },
        { name: 'Light', value: '#ffffff' },
      ],
    },
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
    Story => {
      return (
        <AppStyleProviders>
          <Story />
        </AppStyleProviders>
      );
    },
  ],
};

export default preview;
