import fs from 'node:fs';

/**
 *  @template T the type of expected file contents
 *  @returns {T}
 */
export const readJsonFile = filePath =>
  JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }));
