/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { RouteHandler } from './RouteHandler';
import { NoPermissionRequiredChecker } from './permissions';

export default class extends RouteHandler {
  static PermissionsChecker = NoPermissionRequiredChecker;

  buildResponse = async () => {
    const dashboardItems = await this.models.dashboardItem.all();

    const dashboardItemOptions = dashboardItems.map(({ id, code, config }) => {
      const { name } = config;
      return { id, code, name };
    });

    return dashboardItemOptions;
  };
}
