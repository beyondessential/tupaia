import React from 'react';
import { addDecorator, addParameters } from '@storybook/react';
import * as COLORS from '../stories/story-utils/theme/colors';
import { AppProviders } from '../helpers/AppProviders';

addParameters({
  backgrounds: [
    { name: 'Paper', value: COLORS.WHITE, default: true },
    { name: 'Page', value: COLORS.LIGHTGREY },
    { name: 'Header', value: COLORS.BLUE },
    { name: 'Footer', value: COLORS.DARKGREY },
  ],
});

addDecorator(storyFn => <AppProviders>{storyFn()}</AppProviders>);
