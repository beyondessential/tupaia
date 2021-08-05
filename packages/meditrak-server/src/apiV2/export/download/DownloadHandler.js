/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import fs from 'fs';
import { respondWithDownload, ValidationError } from '@tupaia/utils';
import { RouteHandler } from '../../RouteHandler';
import { assertAdminPanelAccess } from '../../../permissions';

export class DownloadHandler extends RouteHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertAdminPanelAccess);
  }

  async handleRequest() {
    const { filePath } = this.req.params;
    if (!fs.existsSync(filePath)) {
      throw new ValidationError('This link has expired, or the file has already been downloaded');
    }
    respondWithDownload(this.res, filePath, true);
  }
}
