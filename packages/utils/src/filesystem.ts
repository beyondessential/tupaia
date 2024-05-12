/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import fs from 'fs';
import * as path from 'path';
import * as Stream from 'stream';
import sanitize from 'sanitize-filename';

export const readJsonFile = (filePath: string) =>
  JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }));

export const writeJsonFile = (filePath: string, json: any) =>
  fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`);

export const getNestedFiles = (
  dirPath: string,
  options: { extensions: string[] } = { extensions: [] },
) => {
  const files: string[] = [];
  const findNestedFilesRecursively = (currentDirPath: string) => {
    fs.readdirSync(currentDirPath, { withFileTypes: true }).forEach(dirent => {
      const fullPath = `${currentDirPath}/${dirent.name}`;
      if (dirent.isFile()) {
        files.push(fullPath);
      } else {
        findNestedFilesRecursively(fullPath);
      }
    });
  };

  findNestedFilesRecursively(path.resolve(dirPath));

  return files.filter(filePath => options.extensions.some(ext => path.extname(filePath) === ext));
};

export const toFilename = (string: string, stripSpecialAndLowercase = false) => {
  const maxLength = 255;
  let sanitized = sanitize(string);

  if (stripSpecialAndLowercase) {
    sanitized = sanitized
      .replace(/\s+/g, '-') // replace spaces with dashes
      .replace(/ *\([^)]*\) */g, '') // remove text in brackets
      .replace(/[^a-z0-9-]/gi, '') // remove non numbers and letters
      .replace(/-+/g, '-') // remove consecutive dashes
      .toLowerCase();
  }

  return sanitized.length <= maxLength ? sanitized : sanitized.slice(0, maxLength);
};

export const writeStreamToFile = async (filePath: string, stream: Stream) =>
  new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filePath);
    stream.pipe(fileStream);
    fileStream.on('finish', () => resolve(filePath));
    fileStream.on('error', error => reject(error));
  });

/**
 * "Unique Filenames" e.g. "5da02ed278d10e8695530688_Report.pdf" are used to be able to work with uploaded files without
 * worrying about name clashes. The actual fileName is prefixed with a unique string. The delimiter is '_'.
 */
export const getUniqueFileNameParts = (uniqueFileName: string) => {
  const indexOfFirstUnderscore = uniqueFileName.indexOf('_');
  if (indexOfFirstUnderscore === -1) throw new Error('Incorrect uniqueFileName format');
  return {
    uniqueId: uniqueFileName.substring(0, indexOfFirstUnderscore), // the "5da02ed278d10e8695530688" part of "5da02ed278d10e8695530688_Report.pdf"
    fileName: uniqueFileName.substring(indexOfFirstUnderscore + 1), // the "Report.pdf" part of "5da02ed278d10e8695530688_Report.pdf"
  };
};

/**
 * Returns Certificate.pdf, Certificate(1).pdf, Certificate(2).pdf etc.
 */
export const getDeDuplicatedFileName = (
  inputFileName: string,
  allFileNames: string[],
  attempt = 0,
): string => {
  if (allFileNames.length === 0) return inputFileName;

  if (attempt === 0) {
    if (!allFileNames.includes(inputFileName)) {
      return inputFileName;
    }
    return getDeDuplicatedFileName(inputFileName, allFileNames, 1);
  }

  const [nameWithoutExtension, extension] = [
    path.parse(inputFileName).name,
    path.parse(inputFileName).ext,
  ];
  const numberedFileName = `${nameWithoutExtension}(${attempt})${extension}`;

  if (!allFileNames.includes(numberedFileName)) {
    return numberedFileName;
  }
  return getDeDuplicatedFileName(inputFileName, allFileNames, attempt + 1);
};
