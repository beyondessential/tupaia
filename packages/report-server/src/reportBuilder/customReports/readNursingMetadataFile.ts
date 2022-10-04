/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { readFile } from 'fs/promises';
import path from 'path';

export const readNursingMetadataFile = async () => {
  const filePath = path.join(__dirname, './data/palauNursingSurveyMetadata.json');
  const file = await readFile(filePath, 'utf8');
  return JSON.parse(file);
};
