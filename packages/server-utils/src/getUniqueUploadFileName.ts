import path from 'node:path';

const SAFE_EXTENSION = /^\.\w{1,16}$/;

/**
 * Generates the on-disk name for an uploaded file. Nothing from the client-supplied name is kept
 * except a sanitised, lowercased extension (which some importers use to select a parser).
 */
export function getUniqueUploadFileName(originalName: string) {
  const extension = path.extname(originalName);
  const safeExtension = SAFE_EXTENSION.test(extension) ? extension : '';
  return `${crypto.randomUUID()}${safeExtension.toLowerCase()}`;
}
