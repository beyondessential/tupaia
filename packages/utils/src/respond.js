import fs from 'node:fs';

/**
 * Helper function to call the response res with some json
 */
export function respond(res, responseBody, statusCode) {
  // we allow a "overrideRespond" function to be attached to `res`, so that we can change the
  // response mechanism in certain situations
  // motivating use case: if an import process will take too long, we email them the response rather
  // than respond directly to the original http query
  const { overrideRespond } = res;
  if (overrideRespond) {
    return overrideRespond(responseBody);
  }
  return res
    .status(statusCode || 200)
    .type('json')
    .send(JSON.stringify(responseBody));
}

export function respondWithDownload(res, filePath, deleteAfterDownload = true) {
  const { overrideRespond } = res;
  if (overrideRespond) {
    return overrideRespond({ filePath });
  }
  return res.download(filePath, () => {
    if (deleteAfterDownload) {
      fs.unlinkSync(filePath); // delete file from disk after download
    }
  });
}
