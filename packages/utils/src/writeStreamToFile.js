import fs from 'node:fs';

export const writeStreamToFile = async (filePath, stream) =>
  new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filePath);
    stream.pipe(fileStream);
    fileStream.on('finish', () => resolve(filePath));
    fileStream.on('error', error => reject(error));
  });
