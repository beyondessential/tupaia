/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { respondWithDownload } from '@tupaia/utils';
import { RouteHandler } from '../../RouteHandler';
import { assertAdminPanelAccess } from '../../../permissions';

export class DownloadHandler extends RouteHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertAdminPanelAccess);
  }

  async handleRequest() {
    respondWithDownload(this.res, this.req.params.path);
  }
}
