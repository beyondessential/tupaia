/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  S3,
  S3Client,
  ValidationError,
  respondWithDownload,
  writeStreamToFile,
} from '@tupaia/utils';
import { RouteHandler } from './RouteHandler';
import { getTempDirectory } from '../utilities';
import { zipMultipleFiles } from './utilities';

export class DownloadFiles extends RouteHandler {
  assertUserHasAccess() {
    return true; // Any user can download any file for now
  }

  async handleRequest() {
    const { userId } = this.req;
    const { files: filesNamesString, zipFileName = 'download.zip' } = this.query;
    const fileNames = filesNamesString.split(','); // Assuming comma unsupported in filenames

    if (fileNames.length === 0) {
      throw new ValidationError("Must provide a list of file names in the 'files' query parameter");
    }

    const s3Client = new S3Client(new S3());
    const files = await Promise.all(fileNames.map(fileName => s3Client.downloadFile(fileName)));

    // Unique directory to avoid clashes when doing multiple downloads simultaneously
    const tempDir = getTempDirectory(`downloads/${userId}/${Date.now()}`);

    const writeFileToTempDir = async (fileName, file) => {
      const filePath = `${tempDir}/${fileName}`;
      return writeStreamToFile(filePath, file);
    };

    if (files.length === 1) {
      const filePath = await writeFileToTempDir(fileNames[0], files[0]);
      respondWithDownload(this.res, filePath);
    } else {
      const writtenFiles = await Promise.all(
        files.map((file, index) => writeFileToTempDir(fileNames[index], file)),
      );

      const zipFilePath = zipMultipleFiles(`${tempDir}/${zipFileName}`, writtenFiles);
      respondWithDownload(this.res, zipFilePath);
    }
  }
}
