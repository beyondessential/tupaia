/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import sanitize from 'sanitize-filename';
import fs from 'fs';
import path from 'path';

/**
 *  @template T the type of expected file contents
 *  @returns {T}
 */
export const readJsonFile = filePath =>
  JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }));

export const writeJsonFile = (filePath, json) =>
  fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`);

export const getNestedFiles = (dirPath, options = {}) => {
  const files = [];
  const findNestedFilesRecursively = currentDirPath => {
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

  return options.extensions
    ? files.filter(filePath => options.extensions.some(ext => path.extname(filePath) === ext))
    : options;
};

export const toFilename = (string, stripSpecialAndLowercase = false) => {
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
