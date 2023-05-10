import React from 'react';
import { addDecorator } from '@storybook/react';
import { AppProviders } from '../helpers/AppProviders';

export const parameters = {
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
};

addDecorator((story, context) => (
  <AppProviders params={context.parameters}>{story()}</AppProviders>
));
