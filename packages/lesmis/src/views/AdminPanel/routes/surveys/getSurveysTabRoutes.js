/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { surveysTabRoutes } from '@tupaia/admin-panel';
import { getSurveysPageConfigs } from './getSurveysPageConfigs';
import { getQuestionPageConfigs } from './getQuestionPageConfigs';
import { getDataElementsPageConfigs } from './getDataElementsPageConfigs';
import { getSyncGroupsPageConfigs } from './getSyncGroupsPageConfigs';

export const getSurveysTabRoutes = (translate, adminUrl) => {
  return {
    ...surveysTabRoutes,
    label: translate('admin.surveys'),
    childViews: [
      getSurveysPageConfigs(translate, adminUrl),
      getQuestionPageConfigs(translate),
      getDataElementsPageConfigs(translate),
      getSyncGroupsPageConfigs(translate),
    ],
  };
};
