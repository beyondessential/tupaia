/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import AdmZip from 'adm-zip';

export function zipMultipleFiles(exportPath, files) {
  const zip = new AdmZip();
  files.forEach(zip.addLocalFile);
  zip.writeZip(`${exportPath}/tupaia_export_${Date.now()}.zip`);
}
