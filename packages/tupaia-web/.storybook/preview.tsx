import React from 'react';
import type { Preview } from '@storybook/react';
import { AppProviders } from '../src/AppProviders';
import { DARK_BLUE, WHITE } from '../src/theme';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'Dark',
      values: [
        { name: 'Dark', value: DARK_BLUE },
        { name: 'Light', value: WHITE },
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
    Story => {
      return (
        <AppProviders>
          <Story />
        </AppProviders>
      );
    },
  ],
};

export default preview;
