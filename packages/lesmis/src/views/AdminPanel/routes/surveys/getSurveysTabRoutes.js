/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { surveysTabRoutes } from '@tupaia/admin-panel';
import { getSurveysPageConfigs } from './getSurveysPageConfigs';
import { getQuestionPageConfig } from './getQuestionPageConfig';
import { getDataElementsPageConfigs } from './getDataElementsPageConfigs';
import { getSyncGroupsPageConfigs } from './getSyncGroupsPageConfigs';

export const getSurveysTabRoutes = (translate, adminUrl) => {
  return {
    ...surveysTabRoutes,
    label: translate('admin.surveys'),
    childViews: [
      getSurveysPageConfigs(translate, adminUrl),
      getQuestionPageConfig(translate),
      getDataElementsPageConfigs(translate),
      getSyncGroupsPageConfigs(translate),
    ],
  };
};
