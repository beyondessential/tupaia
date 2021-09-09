import React from 'react';
import { addDecorator, addParameters } from '@storybook/react';
import * as COLORS from '../stories/story-utils/theme/colors';
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
