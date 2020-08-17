/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { addDecorator } from '@storybook/react';
import { AppStyleProviders } from '../src/AppStyleProviders';

addDecorator(storyFn => <AppStyleProviders>{storyFn()}</AppStyleProviders>);
