/**
 * SheetJS worksheet name cannot:
 * - contain : \ / ? * [ ]
 * - exceed 31 characters
 * - start or end with apostrophe (')
 * @param {string} name
 * @see /vendor/xlsx-0.20.3/package/xlsx.js:27672-27687
 */
export function sanitizeWorksheetName(name) {
  return (
    name
      .replace(/[:\\/?*[\]\s]+/g, ' ') // remove illegal chars, collapse consecutive whitespaces
      .trim()
      .slice(0, 31)
      .trim()
      .replace(/^'+|'+$/g, '')
      .trim() || 'Sheet 1'
  );
}
