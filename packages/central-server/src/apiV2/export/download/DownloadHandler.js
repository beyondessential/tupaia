/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import fs from 'fs';
import { respondWithDownload, ValidationError } from '@tupaia/utils';
import { RouteHandler } from '../../RouteHandler';
import { assertAdminPanelAccess } from '../../../permissions';
import { getExportPathForUser } from '../getExportPathForUser';

export class DownloadHandler extends RouteHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertAdminPanelAccess);
  }

  async handleRequest() {
    const { params, userId } = this.req;
    const { fileName } = params;
    // user directories mean the same user that generated an export must be logged in to download it
    const filePath = `${getExportPathForUser(userId)}/${fileName}`;
    if (!fs.existsSync(filePath)) {
      throw new ValidationError('This link has expired, or the file has already been downloaded');
    }
    respondWithDownload(this.res, filePath);
  }
}
