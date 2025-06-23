import { surveysTabRoutes } from '@tupaia/admin-panel';
import { getSurveysPageConfig } from './getSurveysPageConfig';
import { getQuestionPageConfig } from './getQuestionPageConfig';
import { getDataElementsPageConfig } from './getDataElementsPageConfig';
import { getSyncGroupsPageConfig } from './getSyncGroupsPageConfig';

export const getSurveysTabRoutes = (translate, adminUrl) => {
  return {
    ...surveysTabRoutes,
    label: translate('admin.surveys'),
    childViews: [
      getSurveysPageConfig(translate, adminUrl),
      getQuestionPageConfig(translate),
      getDataElementsPageConfig(translate),
      getSyncGroupsPageConfig(translate),
    ],
  };
};
