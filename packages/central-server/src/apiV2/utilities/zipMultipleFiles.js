import fs from 'fs';
import AdmZip from 'adm-zip';

export function zipMultipleFiles(filePath, files) {
  const zip = new AdmZip();
  for (const file of files) zip.addLocalFile(file);
  zip.writeZip(filePath);
  for (const file of files) fs.unlinkSync(file);
  return filePath;
}
