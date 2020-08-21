/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { addDecorator, addParameters } from '@storybook/react';
import { AppStyleProviders } from '../src/AppStyleProviders';
import { DARK_BLUE, WHITE } from '../src/styles';

export const parameters = {
  backgrounds: {
    default: 'Dark',
    values: [
      { name: 'Dark', value: DARK_BLUE },
      { name: 'Light', value: WHITE },
    ],
  }
}

addDecorator(storyFn => <AppStyleProviders>{storyFn()}</AppStyleProviders>);
