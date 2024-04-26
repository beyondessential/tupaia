/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function getTempDirectory(name) {
  const directoryPath = path.join(os.tmpdir(), 'tupaia', name);

  try {
    fs.statSync(directoryPath);
  } catch (e) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
  return directoryPath;
}
