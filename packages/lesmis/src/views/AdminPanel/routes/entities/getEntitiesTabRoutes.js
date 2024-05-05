/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { entitiesTabRoutes } from '@tupaia/admin-panel';
import { getEntitiesPageConfig } from './getEntitiesPageConfig';

export const getEntitiesTabRoutes = translate => ({
  ...entitiesTabRoutes,
  title: translate('admin.entities'),
  childViews: [getEntitiesPageConfig(translate)],
});
