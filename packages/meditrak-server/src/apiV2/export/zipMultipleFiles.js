/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import fs from 'fs';
import AdmZip from 'adm-zip';

export function zipMultipleFiles(exportPath, files) {
  const filePath = `${exportPath}/tupaia_export_${Date.now()}.zip`;
  const zip = new AdmZip();
  files.forEach(file => zip.addLocalFile(file));
  zip.writeZip(filePath);
  files.forEach(file => fs.unlinkSync(file));
  return filePath;
}
