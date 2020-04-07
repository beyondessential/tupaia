/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Breadcrumbs, LightBreadcrumbs } from '../components/Breadcrumbs';
import * as COLORS from '../theme/colors';

export default {
  title: 'Breadcrumbs',
  component: LightBreadcrumbs
};

export const breadcrumbs = () => (
  <Breadcrumbs />
);

export const lightBreadcrumbs = () => (
  <LightBreadcrumbs />
);

  lightBreadcrumbs.story = {
  parameters: {
    backgrounds: [{ name: 'Header', value: COLORS.BLUE, default: true }],
  },
};