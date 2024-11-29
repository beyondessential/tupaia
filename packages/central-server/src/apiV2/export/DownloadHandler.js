/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import fs from 'fs';
import { respondWithDownload, UnauthenticatedError, ValidationError } from '@tupaia/utils';
import { getExportPathForUser } from '@tupaia/server-utils';
import { RouteHandler } from '../RouteHandler';

export class DownloadHandler extends RouteHandler {
  // The user must be logged in to download an export
  async assertUserHasAccess() {
    await this.assertPermissions(async () => {
      const apiClient = await this.models.apiClient.findOne({ user_account_id: this.req.userId });

      if (apiClient) {
        throw new UnauthenticatedError('Session not found or has expired. Please log in again.');
      }
      return true;
    });
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
