import { externalDataTabRoutes, externalDatabaseConnections } from '@tupaia/admin-panel';
import { getEntitiesTabRoutes } from './entities';
import { getSurveyResponsesTabRoutes } from './surveyResponses';
import { getSurveysTabRoutes } from './surveys';
import { getUsersTabRoutes } from './users';
import { getVisualisationsTabsRoutes } from './visualisations';

export const getRoutes = (adminUrl, translate) => {
  return [
    getSurveyResponsesTabRoutes(translate, adminUrl),
    getSurveysTabRoutes(translate, adminUrl),
    getVisualisationsTabsRoutes(translate, adminUrl),
    getUsersTabRoutes(translate),
    getEntitiesTabRoutes(translate, adminUrl),
    {
      ...externalDataTabRoutes,
      label: translate('admin.externalData'),
      childViews: [
        {
          ...externalDatabaseConnections,
          title: translate('admin.externalDatabaseConnections'),
        },
      ],
    },
  ];
};
