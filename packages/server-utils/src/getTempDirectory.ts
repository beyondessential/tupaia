import fs from 'fs';
import os from 'os';
import path from 'path';

export function getTempDirectory(name: string) {
  const directoryPath = path.join(os.tmpdir(), 'tupaia', name);

  try {
    fs.statSync(directoryPath);
  } catch (e) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
  return directoryPath;
}
