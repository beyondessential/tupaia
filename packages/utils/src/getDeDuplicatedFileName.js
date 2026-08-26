import * as path from 'node:path';

/**
 * Returns Certificate.pdf, Certificate(1).pdf, Certificate(2).pdf etc.
 * @param {string} inputFileName
 * @param {string[]} allFileNames
 * @param {number} [attempt]
 * @return {string}
 */
export const getDeDuplicatedFileName = (inputFileName, allFileNames, attempt = 0) => {
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
