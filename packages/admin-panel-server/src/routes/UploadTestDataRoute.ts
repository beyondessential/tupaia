import { Request } from 'express';
import fs from 'fs';

import { Route } from '@tupaia/server-boilerplate';
import { readJsonFile, UploadError } from '@tupaia/utils';

export type UploadTestDataRequest = Request<
  Record<string, never>,
  { fileName: string; data: unknown; message: string },
  Record<string, never>,
  Record<string, never>
>;

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
