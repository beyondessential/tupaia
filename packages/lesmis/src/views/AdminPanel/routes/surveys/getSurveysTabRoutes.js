import { surveysTabRoutes } from '@tupaia/admin-panel';
import { getSurveysPageConfig } from './getSurveysPageConfig';
import { getQuestionPageConfig } from './getQuestionPageConfig';
import { getDataElementsPageConfig } from './getDataElementsPageConfig';

export const getSurveysTabRoutes = (translate, adminUrl) => {
  return {
    ...surveysTabRoutes,
    label: translate('admin.surveys'),
    childViews: [
      getSurveysPageConfig(translate, adminUrl),
      getQuestionPageConfig(translate),
      getDataElementsPageConfig(translate),
    ],
  };
};
