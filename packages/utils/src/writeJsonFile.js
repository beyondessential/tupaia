import fs from 'node:fs';

export const writeJsonFile = (filePath, json) =>
  fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`);
