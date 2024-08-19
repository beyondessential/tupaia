/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import fs from 'fs';
import { respondWithDownload, ValidationError } from '@tupaia/utils';
import { getExportPathForUser } from './getExportPathForUser';
import { RouteHandler } from '../RouteHandler';
import { allowNoPermissions } from '../../permissions';

export class DownloadHandler extends RouteHandler {
  async assertUserHasAccess() {
    // This is a special case where we don't need to check permissions, as the user must be logged in anyway and the user can't generate an export without specific permissions
    await this.assertPermissions(allowNoPermissions);
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
