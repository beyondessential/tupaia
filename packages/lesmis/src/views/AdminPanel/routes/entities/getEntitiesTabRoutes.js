import { entitiesTabRoutes } from '@tupaia/admin-panel';
import { getEntitiesPageConfig } from './getEntitiesPageConfig';

export const getEntitiesTabRoutes = translate => ({
  ...entitiesTabRoutes,
  label: translate('admin.entities'),
  childViews: [getEntitiesPageConfig(translate)],
});
