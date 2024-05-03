/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Assignment } from '@material-ui/icons';
import { getSurveysPageConfigs } from './getSurveysPageConfigs';
import { getQuestionPageConfigs } from './getQuestionPageConfigs';
import { getDataElementsPageConfigs } from './getDataElementsPageConfigs';
import { getSyncGroupsPageConfigs } from './getSyncGroupsPageConfigs';

export const getSurveysTabRoutes = (translate, adminUrl) => {
  return {
    label: translate('admin.surveys'),
    path: '/surveys',
    icon: <Assignment />,
    childViews: [
      getSurveysPageConfigs(translate, adminUrl),
      getQuestionPageConfigs(translate),
      getDataElementsPageConfigs(translate),
      getSyncGroupsPageConfigs(translate),
    ],
  };
};
