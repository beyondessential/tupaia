import {
  ValidationError,
  respondWithDownload,
  writeStreamToFile,
  getUniqueFileNameParts,
  getDeDuplicatedFileName,
} from '@tupaia/utils';
import { S3, S3Client, getTempDirectory } from '@tupaia/server-utils';
import { RouteHandler } from './RouteHandler';
import { zipMultipleFiles } from './utilities';

export class DownloadFiles extends RouteHandler {
  assertUserHasAccess() {
    return true; // Any user can download any file for now
  }

  async handleRequest() {
    const { uniqueFileNames: uniqueFileNamesString, zipFileName = 'download.zip' } = this.query;
    const uniqueFileNames = uniqueFileNamesString.split(','); // Assuming comma unsupported in filenames

    if (uniqueFileNames.length === 0) {
      throw new ValidationError(
        "Must provide a list of file names in the 'uniqueFileNames' query parameter",
      );
    }

    const s3Client = new S3Client(new S3());
    const files = await Promise.all(
      uniqueFileNames.map(uniqueFileName => s3Client.downloadFile(uniqueFileName)),
    );

    const tempDir = getTempDirectory(`downloads/`);

    const writeFileToTempDir = async (uniqueFilename, file) => {
      const filePath = `${tempDir}/${uniqueFilename}`;
      return writeStreamToFile(filePath, file);
    };

    if (files.length === 1) {
      const { fileName } = getUniqueFileNameParts(uniqueFileNames[0]);
      const filePath = await writeFileToTempDir(fileName, files[0]);
      respondWithDownload(this.res, filePath);
    } else {
      const writtenFilePaths = [];
      const writtenFileNames = [];

      for (let i = 0; i < files.length; i++) {
        const { fileName } = getUniqueFileNameParts(uniqueFileNames[i]);
        const deduplicatedFileName = getDeDuplicatedFileName(fileName, writtenFileNames);

        writtenFilePaths.push(await writeFileToTempDir(deduplicatedFileName, files[i]));
        writtenFileNames.push(deduplicatedFileName);
      }

      const zipFilePath = zipMultipleFiles(`${tempDir}/${zipFileName}`, writtenFilePaths);
      respondWithDownload(this.res, zipFilePath);
    }
  }
}
