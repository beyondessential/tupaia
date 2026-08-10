import fs from 'node:fs';
import * as path from 'node:path';

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
