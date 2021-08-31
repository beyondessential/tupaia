/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { readJsonFile, UploadError } from '@tupaia/utils';

import fs from 'fs';

export class UploadTestDataRoute extends Route {
  public async buildResponse() {
    if (!this.req.file) {
      throw new UploadError();
    }

    const data = readJsonFile(this.req.file.path);
    fs.unlinkSync(this.req.file.path);

    return {
      fileName: this.req.file.originalname,
      data,
      message: 'Test data uploaded successfully',
    };
  }
}
