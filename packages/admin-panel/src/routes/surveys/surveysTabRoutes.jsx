/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Assignment } from '@material-ui/icons';
import { surveys } from './surveys';
import { questions } from './questions';

export const surveysTabRoutes = {
  label: 'Surveys',
  to: '/surveys',
  exact: true,
  icon: <Assignment />,
  childViews: [surveys, questions],

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
