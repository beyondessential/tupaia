import fs from 'fs';
import AdmZip from 'adm-zip';

export function zipMultipleFiles(filePath, files) {
  const zip = new AdmZip();
  files.forEach(file => zip.addLocalFile(file));
  zip.writeZip(filePath);
  files.forEach(file => fs.unlinkSync(file));
  return filePath;
}
