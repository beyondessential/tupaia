/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import fs from 'fs';
import zlib from 'zlib';

/**
 * Takes a path to an attachment, and generates the attachments object to pass to nodemailer,
 * compressing the attachment if it is too large
 */

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // some email services only support up to 10MB
const compress = path =>
  new Promise((resolve, reject) => {
    const compressedPath = `${path}.gz`;
    const fileContents = fs.createReadStream(path);
    const writeStream = fs.createWriteStream(compressedPath);
    const zip = zlib.createGzip();
    fileContents
      .pipe(zip)
      .pipe(writeStream)
      .on('finish', error => {
        if (error) {
          reject(error);
        } else {
          resolve(compressedPath);
        }
      });
  });

export const getAttachmentForEmail = async path => {
  if (fs.statSync(path).size > MAX_ATTACHMENT_SIZE) {
    return [{ path: await compress(path) }];
  }
  return [{ path }];
};
