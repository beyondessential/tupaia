/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Assignment } from '@material-ui/icons';
import { surveys } from './surveys';

export const surveysTabRoutes = {
  label: 'Surveys',
  to: '/surveys',
  icon: <Assignment />,
  childViews: surveys,
  // {
  //   label: 'Questions',
  //   to: '/questions',
  // },
  // {
  //   label: 'Option Sets',
  //   to: '/option-sets',
  // },
  // {
  //   label: 'Data Elements',
  //   to: '/data-elements',
  // },
  // {
  //   label: 'Data Groups',
  //   to: '/data-groups',
  // },
  // {
  //   label: 'Survey Responses',
  //   to: '/survey-responses',
  // },
  // {
  //   label: 'Sync Groups',
  //   to: '/sync-groups',
  // },
  // {
  //   label: 'Data Mapping',
  //   to: '/data-mapping',
  // },
};
